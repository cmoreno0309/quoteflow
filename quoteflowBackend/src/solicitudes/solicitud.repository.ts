import { prisma } from "../db";
import { EstadoSolicitud } from "@prisma/client";

export class SolicitudRepository {
  create(data: { clienteRef: string; textoOriginal: string }) {
    return prisma.solicitud.create({ data });
  }
  findAll() {
    return prisma.solicitud.findMany({ orderBy: { creadaEn: "desc" } });
  }
  findById(id: string) {
    return prisma.solicitud.findUnique({ where: { id } });
  }
  updateEstado(id: string, estado: EstadoSolicitud) {
    return prisma.solicitud.update({ where: { id }, data: { estado } });
  }
}