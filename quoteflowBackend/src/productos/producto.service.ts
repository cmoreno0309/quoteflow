import { ProductoRepository } from "./producto.repository";

// SERVICIO: la lógica de negocio. Aquí viven las reglas deterministas.
// No sabe de HTTP ni de SQL. Solo decide y calcula.
export class ProductoService {
  constructor(private repo: ProductoRepository) {}

  // CU-01: listar el catálogo.
  listar() {
    return this.repo.findAll();
  }

  // CU-02: cotizar una línea. Motor determinista: el resultado depende
  // solo de los datos, jamás se inventa un precio.
  async cotizarLinea(sku: string, cantidad: number) {
    const p = await this.repo.findBySku(sku);

    // R4: producto que no existe -> se avisa, no se inventa precio.
    if (!p) {
      return { ok: false as const, error: "producto_desconocido" };
    }

    // R4: no hay stock suficiente -> se avisa.
    if (cantidad > p.stock) {
      return { ok: false as const, error: "sin_stock", disponible: p.stock };
    }

    // Todo bien: precio * cantidad. (precio es Decimal en la BD.)
    return {
      ok: true as const,
      sku: p.sku,
      nombre: p.nombre,
      cantidad,
      total: Number(p.precio) * cantidad,
    };
  }
}
