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
