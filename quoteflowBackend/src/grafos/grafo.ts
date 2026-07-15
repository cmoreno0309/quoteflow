import { StateGraph, START, END, interrupt } from "@langchain/langgraph";
import { EstadoSolicitud } from "@prisma/client";
import { EstadoGrafo, EstadoGrafoT, Interprete, Redactor, Linea } from "./tipos";
import { ProductoService } from "../productos/producto.service";
import { ClienteService } from "../clientes/cliente.service";
import { DescuentoService } from "../descuentos/descuento.service";

// Todo lo que el grafo necesita para funcionar (se inyecta al construirlo).
export interface Deps {
  producto: ProductoService;
  cliente: ClienteService;
  descuento: DescuentoService;
  interprete: Interprete;
  redactor: Redactor;
}

const now = () => new Date().toISOString();

export function buildGraph(deps: Deps) {
  // ── NODO: registrar ──
  const ingest = (_s: EstadoGrafoT) => ({
    estado: EstadoSolicitud.NEW,
    audit: [{ nodo: "ingest", nota: "solicitud registrada", ts: now() }],
  });

  // ── NODO: interpretar (IA, hoy stub) ──
  const interpretar = async (s: EstadoGrafoT) => {
    const extraido = await deps.interprete.interpretar(s.rawText);
    const problema = extraido.items.length === 0 ? ("sin_info" as const) : null;
    return {
      extraido,
      problema,
      audit: [{ nodo: "interpretar", nota: `items: ${extraido.items.length}`, ts: now() }],
    };
  };

  // ── NODO: resolver dominio (usa tus servicios deterministas) ──
  const resolverDominio = async (s: EstadoGrafoT) => {
    if (s.problema) return {}; // ya hubo problema antes (sin_info)

    // Cliente conocido/desconocido (ClienteService)
    const idCliente = s.extraido?.clienteId ?? s.clienteRef;
    const cli = await deps.cliente.resolver(idCliente);
    if (!cli.conocido) {
      return {
        cliente: { conocido: false },
        problema: "cliente_desconocido" as const,
        audit: [{ nodo: "resolverDominio", nota: "cliente desconocido", ts: now() }],
      };
    }

    // Cada línea: precio + stock (ProductoService)
    const lineas: Linea[] = [];
    for (const item of s.extraido!.items) {
      const r = await deps.producto.cotizarLinea(item.sku, item.cantidad);
      if (!r.ok) {
        const problema = r.error === "producto_desconocido" ? "producto_desconocido" : "sin_stock";
        return {
          cliente: { conocido: true, id: cli.id, nombre: cli.nombre, tier: cli.tier },
          problema: problema as "producto_desconocido" | "sin_stock",
          audit: [{ nodo: "resolverDominio", nota: `problema: ${r.error}`, ts: now() }],
        };
      }
      lineas.push({ sku: r.sku, nombre: r.nombre, cantidad: r.cantidad, total: r.total });
    }

    return {
      cliente: { conocido: true, id: cli.id, nombre: cli.nombre, tier: cli.tier },
      lineas,
      audit: [{ nodo: "resolverDominio", nota: `líneas: ${lineas.length}`, ts: now() }],
    };
  };

  // ── GATEWAY 1: decidir el camino ──
  const rutaValidacion = (s: EstadoGrafoT): string => {
    if (s.problema === "sin_info") return "aclarar";
    if (s.problema === "cliente_desconocido") return "escalar";
    if (s.problema === "producto_desconocido" || s.problema === "sin_stock") return "detener";
    return "calcular";
  };

  // ── NODO: calcular (determinista: total + evaluación de aprobación) ──
const calcular = (s: EstadoGrafoT) => {
    const subtotal = s.lineas.reduce((acc, l) => acc + l.total, 0);
    const pctPedido = s.extraido?.pctPedido ?? 0;
    const total = subtotal * (1 - pctPedido / 100);

    const evalua = deps.descuento.evaluar({ tier: s.cliente!.tier!, total, pctPedido });

    const base = {
      pricing: { subtotal, pctPedido, total },
      aprobacion: { requerida: evalua.requiereAprobacion, razones: evalua.razones },
      audit: [{ nodo: "calcular", nota: `total ${total}, aprob ${evalua.requiereAprobacion}`, ts: now() }],
    };
    return evalua.requiereAprobacion
      ? { ...base, estado: EstadoSolicitud.PENDING_APPROVAL }
      : base;
  };


  // ── GATEWAY 2: ¿requiere aprobación? ──
  const rutaAprobacion = (s: EstadoGrafoT): string =>
    s.aprobacion?.requerida ? "aprobar" : "redactar";

  // ── NODO: aprobación humana (PAUSA con interrupt) ──
  // interrupt() va primero: al reanudar, el nodo corre de nuevo desde aquí.
  const aprobacionHumana = (s: EstadoGrafoT) => {
    const decision = interrupt({
      motivo: "Requiere aprobación",
      razones: s.aprobacion?.razones ?? [],
      total: s.pricing?.total,
    }) as "approve" | "reject";

    const decisionId = `${s.requestId}:${decision}`; // idempotencia
    return {
      aprobacion: { ...s.aprobacion!, decision, decisionId },
      audit: [{ nodo: "aprobacionHumana", nota: `decisión ${decision}`, ts: now() }],
    };
  };

  const rutaDecision = (s: EstadoGrafoT): string =>
    s.aprobacion?.decision === "approve" ? "redactar" : "rechazar";

  // ── NODO: redactar (IA, hoy stub) ──
  const redactar = async (s: EstadoGrafoT) => ({
    borrador: await deps.redactor.redactar({
      cliente: s.cliente?.nombre,
      lineas: s.lineas,
      total: s.pricing!.total,
      pctPedido: s.pricing!.pctPedido,
    }),
    estado: EstadoSolicitud.DRAFT_READY,
    audit: [{ nodo: "redactar", nota: "borrador generado", ts: now() }],
  });

  // ── NODOS terminales ──
  const aclarar = (_s: EstadoGrafoT) => ({ estado: EstadoSolicitud.NEEDS_CLARIFICATION });
  const escalar = (_s: EstadoGrafoT) => ({ estado: EstadoSolicitud.ESCALATED });
  const detener = (s: EstadoGrafoT) => ({
    estado:
      s.problema === "sin_stock" ? EstadoSolicitud.OUT_OF_STOCK : EstadoSolicitud.UNKNOWN_PRODUCT,
  });
  const rechazar = (_s: EstadoGrafoT) => ({ estado: EstadoSolicitud.REJECTED });

  // ── CABLEADO ──
  return new StateGraph(EstadoGrafo)
    .addNode("ingest", ingest)
    .addNode("interpretar", interpretar)
    .addNode("resolverDominio", resolverDominio)
    .addNode("calcular", calcular)
    .addNode("aprobacionHumana", aprobacionHumana)
    .addNode("redactar", redactar)
    .addNode("aclarar", aclarar)
    .addNode("escalar", escalar)
    .addNode("detener", detener)
    .addNode("rechazar", rechazar)
    .addEdge(START, "ingest")
    .addEdge("ingest", "interpretar")
    .addEdge("interpretar", "resolverDominio")
    .addConditionalEdges("resolverDominio", rutaValidacion, {
      aclarar: "aclarar",
      escalar: "escalar",
      detener: "detener",
      calcular: "calcular",
    })
    .addConditionalEdges("calcular", rutaAprobacion, {
      aprobar: "aprobacionHumana",
      redactar: "redactar",
    })
    .addConditionalEdges("aprobacionHumana", rutaDecision, {
      redactar: "redactar",
      rechazar: "rechazar",
    })
    .addEdge("redactar", END)
    .addEdge("aclarar", END)
    .addEdge("escalar", END)
    .addEdge("detener", END)
    .addEdge("rechazar", END);
}
