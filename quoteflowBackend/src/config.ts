import "dotenv/config";

// Lee una variable numérica del entorno, con valor por defecto y validación.
function num(nombre: string, defecto: number): number {
  const raw = process.env[nombre];
  if (raw === undefined || raw.trim() === "") return defecto;
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    throw new Error(`Config inválida: ${nombre} debe ser un número (llegó "${raw}")`);
  }
  return parsed;
}

// CONFIGURACIÓN CENTRAL DEL SISTEMA.
// Los valores de política vienen del entorno (.env), no del código:
// cambiar un descuento NO requiere redesplegar, solo reiniciar el servicio.
export const config = {
  // Descuento máximo permitido (%) por tier.
  descuentoMaximo: {
    STANDARD: num("DESCUENTO_MAX_STANDARD", 5),
    SILVER: num("DESCUENTO_MAX_SILVER", 10),
    GOLD: num("DESCUENTO_MAX_GOLD", 15),
  },
  // Monto que exige aprobación humana (R1).
  umbralAprobacion: num("UMBRAL_APROBACION", 10_000),
};
