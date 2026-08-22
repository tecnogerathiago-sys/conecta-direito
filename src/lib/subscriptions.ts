import { SubscriptionPlan } from "@prisma/client";

/**
 * Catálogo de planos — fixo no código (só 2 opções), diferente do antigo
 * CoinPackage que era uma tabela editável. A assinatura dá acesso à
 * plataforma e à visibilidade no mural de causas; não é possível comprar
 * causas ou contatos individuais em nenhum plano.
 */
export interface PlanDefinition {
  plan: SubscriptionPlan;
  name: string;
  priceBRL: number;
  features: string[];
}

export const SUBSCRIPTION_PLANS: PlanDefinition[] = [
  {
    plan: "BASICO",
    name: "Básico",
    priceBRL: 79.9,
    features: [
      "Acesso ao mural de causas",
      "Manifestações de interesse ilimitadas",
      "Notificações quando o cliente responder",
    ],
  },
  {
    plan: "PRO",
    name: "Pro",
    priceBRL: 149.9,
    features: [
      "Tudo do plano Básico",
      "Posição de destaque no mural de causas",
      "Atuação em mais regiões simultâneas",
    ],
  },
];

export function getPlanDefinition(plan: SubscriptionPlan): PlanDefinition {
  const found = SUBSCRIPTION_PLANS.find((p) => p.plan === plan);
  if (!found) throw new Error(`Plano desconhecido: ${plan}`);
  return found;
}

/**
 * Id do PreApprovalPlan correspondente no Mercado Pago — criado uma única
 * vez (ver histórico do commit) e referenciado por env var, uma por
 * ambiente (teste/produção usam ids diferentes, assim como o access token).
 * Usar um plano cadastrado em vez de auto_recurring solto é o formato que
 * o Mercado Pago documenta como principal para assinaturas.
 */
export function getMercadoPagoPlanId(plan: SubscriptionPlan): string {
  const envVar = plan === "BASICO" ? "MERCADOPAGO_PLAN_ID_BASICO" : "MERCADOPAGO_PLAN_ID_PRO";
  const id = process.env[envVar];
  if (!id) throw new Error(`${envVar} não configurado.`);
  return id;
}
