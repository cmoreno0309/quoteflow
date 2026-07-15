import { prisma } from "../db";

// REPOSITORIO: la única capa que habla con la base de datos.
// Nadie más sabe de Prisma ni de tablas.
export class ProductoRepository {
  findAll() {
    return prisma.producto.findMany();
  }

  findBySku(sku: string) {
    return prisma.producto.findUnique({ where: { sku } });
  }
}
