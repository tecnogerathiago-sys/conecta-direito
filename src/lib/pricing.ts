import { LegalArea, Urgency } from "@prisma/client";

/**
 * Faixas de custo em moedas por área do direito, seguindo a lógica de
 * lead scoring: áreas de ticket alto / maior complexidade custam mais
 * para o advogado desbloquear.
 */
const AREA_COIN_RANGE: Record<LegalArea, { min: number; max: number }> = {
  CONSUMIDOR: { min: 15, max: 30 },
  CIVEL: { min: 15, max: 30 },
  OUTROS: { min: 15, max: 30 },
  CRIMINAL: { min: 20, max: 35 },
  PREVIDENCIARIO: { min: 20, max: 35 },
  TRIBUTARIO: { min: 25, max: 40 },
  TRABALHISTA: { min: 40, max: 70 },
  FAMILIA: { min: 40, max: 70 },
  EMPRESARIAL: { min: 40, max: 70 },
};

// Urgência mais alta = lead mais "quente" = custa um pouco mais dentro da faixa
const URGENCY_FACTOR: Record<Urgency, number> = {
  BAIXA: 0,
  MEDIA: 0.5,
  ALTA: 1,
};

/**
 * Calcula o custo em moedas para desbloquear um lead, com base na área
 * do direito (complexidade/ticket) e na urgência informada pelo cliente.
 * O resultado é arredondado para o múltiplo de 5 mais próximo para manter
 * os preços "redondos" na vitrine.
 */
export function computeLeadCoinCost(area: LegalArea, urgency: Urgency): number {
  const { min, max } = AREA_COIN_RANGE[area];
  const factor = URGENCY_FACTOR[urgency];
  const raw = min + (max - min) * factor;
  return Math.round(raw / 5) * 5;
}

/** Total de moedas entregues por um pacote (base + bônus). */
export function totalCoinsForPackage(coinAmount: number, bonusCoins: number): number {
  return coinAmount + bonusCoins;
}
