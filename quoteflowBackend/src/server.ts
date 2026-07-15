import "dotenv/config";
import express from "express";
import productoRoutes from "./productos/producto.routes";
import clienteRoutes from "./clientes/cliente.routes";
import descuentoRoutes from "./descuentos/descuento.routes";
import solicitudRoutes from "./solicitudes/solicitud.routes";
import cors from "cors";   

const app = express();
app.use(cors());  
app.use(express.json());
// Salud: para verificar rápido que el server está vivo.
app.get("/health", (_req, res) => res.json({ ok: true }));

// Rutas del dominio.
app.use("/api", productoRoutes);
app.use("/api", clienteRoutes);
app.use("/api", descuentoRoutes);
app.use("/api", solicitudRoutes);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`QuoteFlow API en http://localhost:${PORT}`);
});
