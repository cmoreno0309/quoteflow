# ARCHITECTURE — QuoteFlow

## Stack y por qué

| Pieza      | Elección   | Motivo |
|------------|------------|--------|
| Lenguaje   | TypeScript | Tipado; permitido por el reto. |
| Backend    | Express    | Mínimo y rápido de entregar en el timebox. |
| Datos      | PostgreSQL | Relacional, robusto; ya disponible localmente. |
| Acceso BD  | Prisma     | ORM moderno; esquema versionado con migraciones. |
| Flujo (después) | LangGraph | Motor de proceso con estado, pausas y reanudación durable. |

Las decisiones importantes se registran como ADRs cuando aplique.

## Arquitectura en capas

Cada dominio (empezando por `productos`) se organiza en cuatro capas con
una sola responsabilidad cada una. El SQL nunca queda suelto: vive
encapsulado en el repositorio.

```
HTTP → Controlador → Servicio → Repositorio → Base de datos
```

- **Controlador** (`*.controller.ts`) — traduce HTTP ↔ servicio. Sin lógica de negocio.
- **Servicio** (`*.service.ts`) — reglas de negocio deterministas (precio, stock).
  No sabe de HTTP ni de SQL.
- **Repositorio** (`*.repository.ts`) — única capa que habla con la base (Prisma).
- **Rutas** (`*.routes.ts`) — cablean las tres capas y exponen los endpoints.

## Estructura de carpetas

```
quoteflow/
├── prisma/
│   ├── schema.prisma      # tablas: Producto, Cliente, Solicitud
│   └── seed.ts            # datos de ejemplo
├── src/
│   ├── server.ts          # arranque de Express
│   ├── db.ts              # instancia de Prisma
│   └── productos/         # vertical de producto (4 capas)
│       ├── producto.controller.ts
│       ├── producto.service.ts
│       ├── producto.repository.ts
│       └── producto.routes.ts
└── docs/
    ├── REQUIREMENTS.md
    └── ARCHITECTURE.md
```

## Principios

- **Determinismo (R0).** Precios y stock salen de la base, nunca del modelo.
  El motor de cálculo vive en la capa de servicio y es 100% probable de testear.
- **Migraciones versionadas.** Las tablas se crean con `prisma migrate`, no a mano
  ni al arrancar el servidor: queda historial de cambios.
- **Configuración fuera del código.** La conexión vive en `.env` (ignorado por Git),
  no dentro del `schema.prisma`.
- **Dinero como `Decimal`.** Los precios usan `Decimal(10,2)` para no perder
  centavos por redondeo de punto flotante.

## Qué viene después

El motor de proceso (LangGraph) se montará *sobre* esta base: consumirá las
funciones deterministas de los servicios como herramientas, y añadirá el estado
del flujo, las pausas para aprobación humana y la reanudación durable
(con su propio checkpointer en Postgres). La IA se limitará a interpretar el
texto de la solicitud y a redactar el borrador.
