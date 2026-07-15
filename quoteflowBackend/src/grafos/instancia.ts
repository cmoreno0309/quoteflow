import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { buildGraph } from "./grafo";
import { InterpreteStub, RedactorStub } from "./tipos";
import { InterpreteGemini, RedactorGemini } from "./ia.gemini";
import { ProductoService } from "../productos/producto.service";
import { ProductoRepository } from "../productos/producto.repository";
import { ClienteService } from "../clientes/cliente.service";
import { ClienteRepository } from "../clientes/cliente.repository";
import { DescuentoService } from "../descuentos/descuento.service";

let grafoPromise: ReturnType<typeof construir> | null = null;

async function construir() {
  const usarIA = !!process.env.GOOGLE_API_KEY;
  const deps = {
    producto: new ProductoService(new ProductoRepository()),
    cliente: new ClienteService(new ClienteRepository()),
    descuento: new DescuentoService(),
    interprete: usarIA ? new InterpreteGemini() : new InterpreteStub(),
    redactor: usarIA ? new RedactorGemini() : new RedactorStub(),
  };
  const checkpointer = PostgresSaver.fromConnString(process.env.DATABASE_URL!);
  await checkpointer.setup();
  return buildGraph(deps).compile({ checkpointer });
}

// Devuelve siempre el mismo grafo (lo construye la primera vez).
export function getGraph() {
  if (!grafoPromise) grafoPromise = construir();
  return grafoPromise;
}