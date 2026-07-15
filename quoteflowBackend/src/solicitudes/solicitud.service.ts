import { Command } from "@langchain/langgraph";
import { EstadoSolicitud } from "@prisma/client";
import { SolicitudRepository } from "./solicitud.repository";
import { getGraph } from "../grafos/instancia";

export class SolicitudService {
  constructor(private repo: SolicitudRepository) {}

  // Crea la solicitud, arranca el grafo, guarda el estado resultante.
  async crear(clienteRef: string, texto: string) {
    const sol = await this.repo.create({ clienteRef, textoOriginal: texto });
    const graph = await getGraph();
    const config = { configurable: { thread_id: sol.id } };

    const res: any = await graph.invoke(
      { requestId: sol.id, clienteRef, rawText: texto },
      config
    );

    const estado = (res.estado as EstadoSolicitud) ?? EstadoSolicitud.NEW;
    await this.repo.updateEstado(sol.id, estado);

    return {
      id: sol.id,
      estado,
      pausada: !!res.__interrupt__,
      extraido: res.extraido ?? null,
      pricing: res.pricing ?? null,
      aprobacion: res.aprobacion ?? null,
      borrador: res.borrador ?? null,
    };
  }

  listar() {
    return this.repo.findAll();
  }

  // Detalle: junta lo de la tabla + el estado guardado en el grafo.
  async detalle(id: string) {
    const sol = await this.repo.findById(id);
    if (!sol) return null;
    const graph = await getGraph();
    const snap = await graph.getState({ configurable: { thread_id: id } });
    const v: any = snap?.values ?? {};
    return {
      id: sol.id,
      clienteRef: sol.clienteRef,
      textoOriginal: sol.textoOriginal,
      estado: sol.estado,
      creadaEn: sol.creadaEn,
      extraido: v.extraido ?? null,
      cliente: v.cliente ?? null,
      lineas: v.lineas ?? [],
      pricing: v.pricing ?? null,
      aprobacion: v.aprobacion ?? null,
      borrador: v.borrador ?? null,
      traza: v.audit ?? [],
    };
  }

  // Reanuda el grafo con la decisión humana (approve/reject).
  async decidir(id: string, decision: "approve" | "reject") {
    const graph = await getGraph();
    const config = { configurable: { thread_id: id } };
    const res: any = await graph.invoke(new Command({ resume: decision }), config);
    const estado = (res.estado as EstadoSolicitud) ?? EstadoSolicitud.NEW;
    await this.repo.updateEstado(id, estado);
    return { id, estado, borrador: res.borrador ?? null };
  }
}