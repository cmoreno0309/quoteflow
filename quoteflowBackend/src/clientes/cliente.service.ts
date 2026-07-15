import { ClienteRepository } from "./cliente.repository";

// SERVICIO: reglas de negocio del cliente. Sin HTTP ni SQL.
export class ClienteService {
  constructor(private repo: ClienteRepository) {}

  // Listar todos los clientes conocidos.
  listar() {
    return this.repo.findAll();
  }

  // Lógica NUEVA: resolver si un cliente es conocido o no.
  // Esta es la función que el grafo usará para aplicar R3
  // (cliente desconocido -> escalar a revisión).
  async resolver(id: string) {
    const cliente = await this.repo.findById(id);

    // R3: no está en la base -> desconocido.
    if (!cliente) {
      return { conocido: false as const, id };
    }

    // Conocido: devolvemos sus datos, incluido el tier
    // (que luego define su descuento permitido).
    return {
      conocido: true as const,
      id: cliente.id,
      nombre: cliente.nombre,
      tier: cliente.tier,
    };
  }
}
