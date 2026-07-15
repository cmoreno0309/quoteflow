import { Request, Response } from "express";
import { ClienteService } from "./cliente.service";

// CONTROLADOR: solo traduce HTTP <-> servicio.
export class ClienteController {
  constructor(private service: ClienteService) {}

  listar = async (_req: Request, res: Response) => {
    const clientes = await this.service.listar();
    res.json(clientes);
  };

  // GET /api/clientes/:id  -> ¿conocido o desconocido?
  resolver = async (req: Request, res: Response) => {
    const { id } = req.params;
    const resultado = await this.service.resolver(id);
    res.json(resultado);
  };
}
