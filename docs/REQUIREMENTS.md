# REQUIREMENTS — QuoteFlow

## Objetivo

Preparar borradores de cotización a partir de solicitudes en texto libre,
sin enviar nada al cliente y sin inventar datos. Los precios, stock y
descuentos salen siempre de fuentes deterministas; la IA (más adelante)
solo interpreta el texto y redacta.

## Reglas de negocio

- **R1.** Cotización mayor a USD 10,000 → requiere aprobación humana.
- **R2.** Descuento fuera de la política del tier → requiere aprobación.
- **R3.** Cliente desconocido → escalar a revisión (no cotizar).
- **R4.** Producto desconocido o sin stock suficiente → detener.
- **R5.** Falta información esencial → pedir aclaración antes de cotizar.
- **R0 (transversal).** El sistema nunca inventa datos: precios y stock
  provienen de la base de datos, no del modelo.

---

## Casos de uso

### CU-01 — Consultar catálogo  ✅ implementado
- **Actor:** asesor / sistema.
- **Descripción:** obtener la lista de productos con precio y stock.
- **Función:** `GET /api/productos` → `ProductoService.listar()`.
- **Criterios de aceptación:**
  - CA-01.1 — Devuelve todos los productos con `sku`, `nombre`, `precio`, `stock`.
  - CA-01.2 — Si no hay productos, devuelve lista vacía (no error).

### CU-02 — Cotizar una línea de producto  ✅ implementado
- **Actor:** sistema (motor de cálculo determinista).
- **Descripción:** dado un `sku` y una `cantidad`, calcular el total o
  indicar por qué no se puede.
- **Función:** `POST /api/productos/cotizar { sku, cantidad }`
  → `ProductoService.cotizarLinea()`.
- **Criterios de aceptación:**
  - CA-02.1 — Producto existente y stock suficiente → `total = precio × cantidad`.
  - CA-02.2 — Producto inexistente → error `producto_desconocido` (R4). No inventa precio.
  - CA-02.3 — `cantidad` mayor al stock → error `sin_stock` con `disponible` (R4).

### CU-03 — Ingresar una solicitud de cotización  ⏳ planificado
- **Actor:** asesor.
- **Descripción:** registrar una solicitud (cliente + texto libre) que
  entra a la bandeja con estado inicial `NEW`.
- **Función (prevista):** `POST /api/solicitudes { clienteRef, texto }`.
- **Criterios de aceptación:**
  - CA-03.1 — Crea la solicitud con estado `NEW` y la devuelve con su `id`.
  - CA-03.2 — Guarda el texto original tal cual (entrada no confiable).

### CU-04 — Ver la bandeja de solicitudes  ⏳ planificado
- **Actor:** asesor.
- **Función (prevista):** `GET /api/solicitudes`.
- **Criterios de aceptación:**
  - CA-04.1 — Lista cada solicitud con cliente, resumen y estado actual.

### CU-05 — Procesar una solicitud (flujo con IA)  ⏳ planificado
- **Actor:** sistema (grafo LangGraph).
- **Descripción:** interpretar el texto, consultar dominio, calcular y
  enrutar a uno de los resultados (R1–R5).
- **Criterios de aceptación:**
  - CA-05.1 — Aplica R1–R5 y deja la solicitud en el estado correcto.
  - CA-05.2 — Los números salen del dominio, nunca del modelo (R0).

### CU-06 — Aprobar o rechazar  ⏳ planificado
- **Actor:** gerente comercial.
- **Descripción:** para solicitudes en `PENDING_APPROVAL`, aprobar o rechazar;
  el flujo se reanuda desde donde quedó.
- **Criterios de aceptación:**
  - CA-06.1 — Aprobar → `DRAFT_READY`. Rechazar → `REJECTED`.
  - CA-06.2 — Aplicar la misma decisión dos veces → un solo efecto (idempotencia).

---

## Alcance por etapas

- **Esta etapa (backend base):** CU-01, CU-02. Motor determinista de producto,
  sin IA, con base de datos y datos de ejemplo.
- **Siguientes:** CU-03/04 (solicitudes y bandeja), CU-05 (grafo LangGraph + IA),
  CU-06 (aprobación humana con reanudación durable).
