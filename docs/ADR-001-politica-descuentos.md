# ADR-001 — Política de descuentos en configuración externa

**Estado:** aceptado
**Fecha:** [fecha]

## Contexto

Los descuentos máximos por tier y el umbral de aprobación son valores de
negocio que cambian con el tiempo (campañas, ajustes comerciales). No deben
estar embebidos en el código: un cambio de política no puede exigir un
redespliegue del sistema.

## Opciones consideradas

1. **Constante en código.** Simple, pero cambiarla exige recompilar y
   redesplegar. Descartada por mantenibilidad.
2. **Configuración externa (env/properties).** Los valores viven en `.env`.
   Cambiarlos requiere solo reiniciar el servicio, no redesplegar código.
3. **Tabla en base de datos.** Administrable por negocio con un CRUD, sin
   reiniciar. Es lo ideal en producción, pero añade tabla, repositorio y
   consulta asíncrona.

## Decisión

Se adopta la **opción 2 (configuración externa)** para esta entrega. Resuelve
el requisito real —cambiar descuentos sin redesplegar— con el menor costo
dentro del timebox. Los valores se leen en un módulo central (`src/config.ts`).

## Consecuencias

- Cambiar un descuento = editar `.env` + reiniciar. Sin redespliegue.
- La lógica de decisión (`descuento.service.ts`) no cambia si cambian los valores.

## Evolución futura

Migrar la política a una **tabla en la base de datos** (opción 3), con un
endpoint de administración para que negocio edite los valores sin intervención
técnica ni reinicio. La capa de servicio ya está aislada de la fuente del dato,
así que este cambio no afectaría la lógica de negocio.
