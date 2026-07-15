import { Annotation } from "@langchain/langgraph";
import { EstadoSolicitud, Tier } from "@prisma/client";

// ─────────── Tipos de datos que viajan por el grafo ───────────

export interface ItemPedido {
  sku: string;
  cantidad: number;
}

export interface Extraido {
  items: ItemPedido[];
  clienteId?: string;
  pctPedido?: number; // descuento solicitado en el texto
}

export interface Linea {
  sku: string;
  nombre: string;
  cantidad: number;
  total: number;
}

export interface AuditEntry {
  nodo: string;
  nota: string;
  ts: string;
}

// ─────────── Interfaces de la IA (hoy con stub; mañana Gemini) ───────────

export interface Interprete {
  interpretar(rawText: string): Promise<Extraido>;
}

export interface Redactor {
  redactar(resumen: {
    cliente?: string;
    lineas: Linea[];
    total: number;
    pctPedido: number;
  }): Promise<string>;
}

// STUB temporal del intérprete: parseo simple por reglas.
// Se reemplaza por el LLM en la Capa 3. Sirve para correr y testear el grafo.
export class InterpreteStub implements Interprete {
  async interpretar(rawText: string): Promise<Extraido> {
    const items: ItemPedido[] = [];
    // primero saco el cliente (CLI-xxx) para no confundirlo con un producto
    const cli = rawText.match(/(CLI-\d+)/i);
    const clienteId = cli ? cli[1].toUpperCase() : undefined;
    const sinCliente = clienteId ? rawText.replace(new RegExp(clienteId, "i"), "") : rawText;

    // busca "HX-200 x20" o "HX-200 20" (ya sin el CLI-xxx de por medio)
    const re = /([A-Z]{2,}-\d+)\s*x?\s*(\d+)/gi;
    let m;
    while ((m = re.exec(sinCliente)) !== null) {
      items.push({ sku: m[1].toUpperCase(), cantidad: Number(m[2]) });
    }
    const pct = rawText.match(/(\d+)\s*%/);
    return {
      items,
      clienteId,
      pctPedido: pct ? Number(pct[1]) : 0,
    };
  }
}

// STUB temporal del redactor: arma un texto simple con los números del estado.
export class RedactorStub implements Redactor {
  async redactar(r: { cliente?: string; lineas: Linea[]; total: number; pctPedido: number }): Promise<string> {
    const detalle = r.lineas
      .map((l) => `- ${l.cantidad} x ${l.nombre} = ${l.total}`)
      .join("\n");
    return [
      `Estimado ${r.cliente ?? "cliente"},`,
      `Adjuntamos su cotización:`,
      detalle,
      `Descuento aplicado: ${r.pctPedido}%`,
      `Total: ${r.total}`,
    ].join("\n");
  }
}

// ─────────── Estado del grafo (tipado y explícito) ───────────

export const EstadoGrafo = Annotation.Root({
  requestId: Annotation<string>(),
  clienteRef: Annotation<string>(),
  rawText: Annotation<string>(),

  extraido: Annotation<Extraido | null>(),
  cliente: Annotation<{ conocido: boolean; id?: string; nombre?: string; tier?: Tier } | null>(),
  lineas: Annotation<Linea[]>({ reducer: (_a, b) => b, default: () => [] }),

  // por qué se detuvo, si aplica
  problema: Annotation<
    "sin_info" | "cliente_desconocido" | "producto_desconocido" | "sin_stock" | null
  >(),

  pricing: Annotation<{ subtotal: number; pctPedido: number; total: number } | null>(),
  aprobacion: Annotation<{
    requerida: boolean;
    razones: string[];
    decision?: "approve" | "reject";
    decisionId?: string;
  } | null>(),

  borrador: Annotation<string | null>(),
  estado: Annotation<EstadoSolicitud>(),

  audit: Annotation<AuditEntry[]>({
    reducer: (a, b) => a.concat(b),
    default: () => [],
  }),
});

export type EstadoGrafoT = typeof EstadoGrafo.State;
