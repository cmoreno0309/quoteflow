# QuoteFlow — Backend

Asistente que prepara borradores de cotización para AndesPro Industrial.
Esta etapa cubre el backend base (sin IA): catálogo de productos y motor
determinista de cotización, sobre Express + Prisma + PostgreSQL.

## Requisitos previos

- Node.js 20+
- PostgreSQL corriendo localmente
- Una base de datos creada:  `createdb quoteflow`

## Puesta en marcha

```bash
# 1. Dependencias
npm install

# 2. Configura la conexión
cp .env.example .env        # edita DATABASE_URL con tu usuario/contraseña

# 3. Un solo comando: crea las tablas E inserta los datos de ejemplo
npm run setup

# 4. Levanta la API
npm run dev
```

La API queda en `http://localhost:3000`.

## Comandos

| Comando         | Qué hace                                            |
|-----------------|-----------------------------------------------------|
| `npm run setup` | Migración (crea tablas) + seed (datos de ejemplo)   |
| `npm run dev`   | Levanta la API en modo desarrollo                   |
| `npm run seed`  | Reinserta los datos de ejemplo                      |
| `npm run studio`| Abre Prisma Studio para ver las tablas              |

## Endpoints disponibles

| Método | Ruta                    | Qué hace                          |
|--------|-------------------------|-----------------------------------|
| GET    | `/health`               | Verifica que la API está viva     |
| GET    | `/api/productos`        | Lista el catálogo                 |
| POST   | `/api/productos/cotizar`| Cotiza una línea `{ sku, cantidad }` |

Ejemplo:

```bash
curl -X POST http://localhost:3000/api/productos/cotizar \
  -H "Content-Type: application/json" \
  -d '{"sku":"HX-200","cantidad":20}'
```

## Estado del proyecto

- [x] Base de datos + datos de ejemplo
- [x] Catálogo y motor de cotización determinista (sin IA)
- [ ] Ingreso de solicitudes y bandeja
- [ ] Grafo LangGraph (flujo con estado, pausas y reanudación)
- [ ] Interpretación con IA + borrador
- [ ] Frontend

Ver `docs/REQUIREMENTS.md` y `docs/ARCHITECTURE.md` para el detalle.
