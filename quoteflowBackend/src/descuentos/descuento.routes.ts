import { Router, Request, Response } from "express";
import { DescuentoService } from "./descuento.service";

const service = new DescuentoService();

const router = Router();

// POST /api/descuentos/evaluar  { tier, total, pctPedido }
router.post("/descuentos/evaluar", (req: Request, res: Response) => {
  const { tier, total, pctPedido } = req.body;
  if (!tier || typeof total !== "number" || typeof pctPedido !== "number") {
    return res.status(400).json({ error: "faltan tier, total o pctPedido" });
  }
  const resultado = service.evaluar({ tier, total, pctPedido });
  res.json(resultado);
});

export default router;
