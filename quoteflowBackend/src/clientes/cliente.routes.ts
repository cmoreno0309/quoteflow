import { Router } from "express";
import { ClienteRepository } from "./cliente.repository";
import { ClienteService } from "./cliente.service";
import { ClienteController } from "./cliente.controller";

// Cableado: repo -> service -> controller.
const repo = new ClienteRepository();
const service = new ClienteService(repo);
const controller = new ClienteController(service);

const router = Router();
router.get("/clientes", controller.listar);
router.get("/clientes/:id", controller.resolver);

export default router;
