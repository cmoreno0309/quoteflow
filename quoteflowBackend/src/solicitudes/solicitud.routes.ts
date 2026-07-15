import { Router } from "express";
import { SolicitudRepository } from "./solicitud.repository";
import { SolicitudService } from "./solicitud.service";
import { SolicitudController } from "./solicitud.controller";

const repo = new SolicitudRepository();
const service = new SolicitudService(repo);
const controller = new SolicitudController(service);

const router = Router();
router.post("/solicitudes", controller.crear);
router.get("/solicitudes", controller.listar);
router.get("/solicitudes/:id", controller.detalle);
router.post("/solicitudes/:id/decision", controller.decidir);

export default router;