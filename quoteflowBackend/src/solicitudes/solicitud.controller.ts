import { Request, Response } from "express";
import { SolicitudService } from "./solicitud.service";

export class SolicitudController {
  constructor(private service: SolicitudService) {}

  crear = async (req: Request, res: Response) => {
    const { clienteRef, texto } = req.body;
    if (!clienteRef || !texto) {
      return res.status(400).json({ error: "faltan clienteRef o texto" });
    }
    res.json(await this.service.crear(clienteRef, texto));
  };

  listar = async (_req: Request, res: Response) => {
    res.json(await this.service.listar());
  };

  detalle = async (req: Request, res: Response) => {
    const r = await this.service.detalle(req.params.id);
    if (!r) return res.status(404).json({ error: "no existe" });
    res.json(r);
  };

  decidir = async (req: Request, res: Response) => {
    const { decision } = req.body;
    if (decision !== "approve" && decision !== "reject") {
      return res.status(400).json({ error: "decision debe ser approve o reject" });
    }
    res.json(await this.service.decidir(req.params.id, decision));
  };
}