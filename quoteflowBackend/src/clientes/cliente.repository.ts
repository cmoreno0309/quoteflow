import { prisma } from "../db";

// REPOSITORIO: única capa que habla con la base.
export class ClienteRepository {
  findAll() {
    return prisma.cliente.findMany();
  }

  findById(id: string) {
    return prisma.cliente.findUnique({ where: { id } });
  }
}
