import { Router } from "express";
import { ProductoRepository } from "./producto.repository";
import { ProductoService } from "./producto.service";
import { ProductoController } from "./producto.controller";

// Cableado de las capas: repo -> service -> controller.
const repo = new ProductoRepository();
const service = new ProductoService(repo);
const controller = new ProductoController(service);

const router = Router();
router.get("/productos", controller.listar);
router.post("/productos/cotizar", controller.cotizar);

export default router;
