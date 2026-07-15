import { Request, Response } from "express";
import { ProductoService } from "./producto.service";

// CONTROLADOR: solo traduce HTTP <-> servicio. No tiene lógica de negocio.
export class ProductoController {
  constructor(private service: ProductoService) {}

  listar = async (_req: Request, res: Response) => {
    const productos = await this.service.listar();
    res.json(productos);
  };

  cotizar = async (req: Request, res: Response) => {
    const { sku, cantidad } = req.body;
    if (!sku || typeof cantidad !== "number") {
      return res.status(400).json({ error: "faltan sku o cantidad (número)" });
    }
    const resultado = await this.service.cotizarLinea(sku, cantidad);
    res.json(resultado);
  };
}
