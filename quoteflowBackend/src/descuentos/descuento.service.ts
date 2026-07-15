import { Tier } from "@prisma/client";
import { DESCUENTO_MAXIMO, UMBRAL_APROBACION } from "../politica/descuento.policy";

// SERVICIO DE DESCUENTO: decide, de forma determinista, si un descuento
// está dentro de política o si necesita aprobación humana.
// Es una función pura: mismos datos de entrada -> misma respuesta.
export class DescuentoService {
  // R2: ¿el descuento pedido está permitido para ese tier?
  descuentoPermitido(tier: Tier, pctPedido: number): boolean {
    const maximo = DESCUENTO_MAXIMO[tier];
    return pctPedido <= maximo;
  }

  // Decisión completa sobre una cotización: aplica R1 y R2.
  // Devuelve si requiere aprobación humana y por qué.
  evaluar(params: { tier: Tier; total: number; pctPedido: number }) {
    const { tier, total, pctPedido } = params;

    const razones: string[] = [];

    // R1: monto grande.
    if (total > UMBRAL_APROBACION) {
      razones.push(`total ${total} supera el umbral ${UMBRAL_APROBACION}`);
    }

    // R2: descuento fuera de política.
    if (!this.descuentoPermitido(tier, pctPedido)) {
      razones.push(
        `descuento ${pctPedido}% supera el máximo ${DESCUENTO_MAXIMO[tier]}% del tier ${tier}`
      );
    }

    return {
      requiereAprobacion: razones.length > 0,
      razones,
      maximoPermitido: DESCUENTO_MAXIMO[tier],
    };
  }
}
