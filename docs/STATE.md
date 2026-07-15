# STATE — Estado del proyecto QuoteFlow

**Fecha:** [fecha]

## Resumen

MVP funcional de punta a punta: una solicitud en texto libre se interpreta, se resuelve
contra el dominio, se calcula de forma determinista, se enruta a uno de los cinco
resultados, pausa para aprobación humana cuando corresponde (con reanudación durable),
y genera un borrador. Backend + frontend + base de datos + IA, integrados.

## Hecho

- [x] **Capa 1 — Dominio determinista:** productos (precio/stock), clientes
      (conocido/desconocido), descuentos (política R1/R2). En capas, con endpoints probados.
- [x] **Capa 2 — Grafo LangGraph:** estado tipado, nodos, rutas condicionales, `interrupt`
      para human-in-the-loop, checkpointer en Postgres (reanudación durable verificada).
- [x] **Capa 3 — IA (Gemini):** extracción con salida estructurada y redacción de borrador,
      detrás de interfaces inyectables, con **fallback determinista** si el modelo falla.
- [x] **Capa 4 — Frontend (Angular):** bandeja, detalle con cotización/razones/traza,
      aprobar/rechazar, y formulario de creación. Flujo completo desde el navegador.
- [x] **HTTP:** API de solicitudes (crear, listar, detalle, decidir) que orquesta el grafo.
- [x] **Documentación:** README, REQUIREMENTS, ARCHITECTURE, ADR-001, BUSINESS_CASE, AI_USE.

## Deuda técnica aceptada (consciente, por el timebox)

- **Política de descuentos en configuración (.env), no en tabla.** Resuelve el requisito
  (cambiar sin redesplegar); la evolución a tabla administrable está en ADR-001.
- **Sin autenticación / autorización.** Fuera de alcance del MVP.
- **Pruebas manuales, no automatizadas.** Los caminos se validaron a mano; falta una suite
  de tests (que el diseño ya facilita: servicios puros e IA inyectable).
- **Matching de SKU simple.** Depende de que el modelo devuelva un SKU válido; un caso real
  querría normalización/tolerancia de nombres de producto.
- **Sin integraciones reales** (email/WhatsApp/ERP): el envío al cliente es manual, por diseño.
- **Frontend funcional, sin diseño avanzado** (fuera de alcance explícito del reto).

## Próximos pasos (si hubiera más tiempo)

1. Suite de tests automatizados de reglas, routing, interrupción e idempotencia (modo sin IA).
2. Migrar la política de descuentos a tabla con endpoint de administración (ADR-001).
3. Normalización de productos (tolerar variaciones de nombre → SKU).
4. Autenticación y roles (ejecutivo vs. aprobador).
5. Observabilidad: registrar cuándo se usó el fallback de IA y por qué.

## Cómo correr

Ver `README.md`. Resumen: Postgres arriba → backend (`npm run setup` + `npm run dev`) →
frontend (`ng serve`). Requiere `.env` con `DATABASE_URL` y `GOOGLE_API_KEY`.
