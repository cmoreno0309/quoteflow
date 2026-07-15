import { Tier } from "@prisma/client";
import { config } from "../config";

// POLÍTICA DE DESCUENTOS — ahora se lee de configuración externa (.env),
// no está hardcodeada. Cambiar un valor no requiere redesplegar el sistema.
//
// Evolución documentada (ver docs/ADR-001-politica-descuentos.md):
// el siguiente paso de mantenibilidad es mover esto a una tabla en la BD,
// administrable por negocio con un CRUD, sin reiniciar siquiera.
export const DESCUENTO_MAXIMO: Record<Tier, number> = config.descuentoMaximo;

// Umbral de monto que exige aprobación humana (regla R1).
export const UMBRAL_APROBACION = config.umbralAprobacion;
