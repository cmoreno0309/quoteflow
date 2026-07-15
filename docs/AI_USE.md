# AI_USE — Uso de IA en el desarrollo de QuoteFlow

Este documento describe cómo se usó la IA **para construir** el proyecto (metodología),
distinto de cómo el producto usa IA (eso está en ARCHITECTURE.md).

## Herramientas usadas

- **Asistente de IA (pair-programming):** apoyo en diseño de arquitectura, generación
  de código base, explicación de conceptos (LangGraph, checkpointer) y depuración de errores.
- **Gemini (dentro del producto):** interpretación de texto libre y redacción de borradores,
  detrás de una interfaz que permite reemplazarlo o caer a un fallback determinista.

## Rol asignado a la IA

La IA actuó como **asistente y consultor técnico**, no como autor autónomo. Las decisiones
de diseño (stack, arquitectura en capas, externalizar configuración, alcance del MVP) las
tomé yo; la IA propuso opciones y trade-offs, y generó código que luego revisé, corrí y ajusté.

El criterio de trabajo fue: construir de abajo hacia arriba (dominio determinista → grafo →
IA → frontend), probando cada pieza antes de avanzar, para entender el sistema y poder
defenderlo, no solo hacerlo funcionar.

## Outputs aceptados

- Estructura en capas (controlador → servicio → repositorio) por dominio.
- Esquema de datos en Prisma y migraciones versionadas.
- Grafo LangGraph con estado tipado, rutas condicionales, `interrupt` para aprobación
  humana y checkpointer en Postgres.
- Interfaces inyectables para la IA (permiten testear sin modelo real y degradar con fallback).
- Externalización de la política de descuentos a configuración (ver ADR-001).

## Outputs corregidos o rechazados

- **Descuentos hardcodeados:** la primera versión puso los máximos de descuento como
  constantes en código. Lo rechacé por mantenibilidad (un cambio no puede exigir
  redespliegue) y se movió a configuración externa, documentado como ADR-001.
- **Grafo de juguete inicial:** se usó un grafo mínimo solo para entender la mecánica de
  pausa/reanudación; se descartó al construir el grafo real.
- **Nombre de modelo Gemini:** el modelo sugerido (`gemini-2.5-flash`) devolvía 404 para
  cuentas nuevas; se cambió a un modelo vigente tras verificar.
- **Parser por regex:** el extractor temporal confundía el ID de cliente (CLI-003) con un
  SKU. Se corrigió y, sobre todo, se reemplazó por la interpretación con IA, que entiende
  el contexto sin reglas frágiles.

## Cómo verifiqué

- **Ejecución incremental:** cada pieza se corrió y probó antes de seguir.
- **Pruebas manuales de endpoints:** con `curl` y desde el navegador, cubriendo los caminos
  del flujo (feliz, requiere aprobación, detenido por stock, cliente desconocido).
- **Inspección de datos:** Prisma Studio para verificar tablas, seed y estados.
- **Depuración real:** se resolvieron problemas concretos (CORS entre frontend y backend,
  configuración de TypeScript, disparo del seed, conexión a Postgres, límite de tasa de
  Gemini) entendiendo la causa, no por prueba y error a ciegas.
- **Verificación del determinismo:** se confirmó que los números (precio, descuento, total)
  provienen de las funciones de dominio y no del modelo.

## Límite explícito

La IA no decide reglas de negocio ni calcula montos. Interpreta texto y redacta prosa;
todo lo que afecta dinero o decisiones pasa por código determinista y, cuando corresponde,
por aprobación humana.
