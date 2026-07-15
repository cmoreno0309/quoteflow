import "dotenv/config";
import { Command } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

import { buildGraph } from "./grafo";
import { InterpreteStub, RedactorStub } from "./tipos";
import { InterpreteGemini, RedactorGemini } from "./ia.gemini";
import { ProductoService } from "../productos/producto.service";
import { ProductoRepository } from "../productos/producto.repository";
import { ClienteService } from "../clientes/cliente.service";
import { ClienteRepository } from "../clientes/cliente.repository";
import { DescuentoService } from "../descuentos/descuento.service";

async function main() {
  // 1. Dependencias: servicios reales + IA (Gemini si hay API key, si no stub)
  const usarIA = !!process.env.GOOGLE_API_KEY;
  console.log(usarIA ? "IA: Gemini ✨" : "IA: stub (sin GOOGLE_API_KEY)");

  const deps = {
    producto: new ProductoService(new ProductoRepository()),
    cliente: new ClienteService(new ClienteRepository()),
    descuento: new DescuentoService(),
    interprete: usarIA ? new InterpreteGemini() : new InterpreteStub(),
    redactor: usarIA ? new RedactorGemini() : new RedactorStub(),
  };

  // 2. Checkpointer sobre tu Postgres (reanudación durable)
  const checkpointer = PostgresSaver.fromConnString(process.env.DATABASE_URL!);
  await checkpointer.setup();

  // 3. Compilar el grafo
  const graph = buildGraph(deps).compile({ checkpointer });

  // 4. Un texto de ejemplo (cámbialo para probar otros caminos)
  const requestId = process.argv[2] ?? `sol-${Date.now()}`;
  const rawText =
    process.argv[3] ??
    "cliente CLI-003 quiere HX-200 x10 con 8% de descuento"; // dispara aprobación (R2)

  const config = { configurable: { thread_id: requestId } };

  console.log(`\n=== Solicitud ${requestId} ===`);
  console.log(`Texto: "${rawText}"\n`);

  // 5. Correr el grafo
  const res: any = await graph.invoke({ requestId, clienteRef: "CLI-003", rawText }, config);

  // 6. ¿Se pausó esperando aprobación?
  if (res.__interrupt__) {
    console.log("⏸  PAUSADO esperando aprobación:");
    console.log("   Razones:", res.aprobacion?.razones);
    console.log("   Reanudando con 'approve'...\n");

    const final: any = await graph.invoke(new Command({ resume: "approve" }), config);
    imprimir(final);
  } else {
    imprimir(res);
  }
}

function imprimir(s: any) {
  console.log("Estado final:", s.estado);
  if (s.borrador) console.log("\n--- Borrador ---\n" + s.borrador);
  console.log("\nTraza:");
  for (const a of s.audit ?? []) console.log(`  · ${a.nodo}: ${a.nota}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
