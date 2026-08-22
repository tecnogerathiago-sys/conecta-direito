import { MercadoPagoConfig, PreApproval, PreApprovalPlan, Payment } from "mercadopago";

function requireAccessToken(): string {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      "MERCADOPAGO_ACCESS_TOKEN não configurado. Defina a variável de ambiente antes de habilitar PAYMENTS_ENABLED."
    );
  }
  return accessToken;
}

/**
 * Cliente do Mercado Pago para assinaturas recorrentes (PreApproval, cartão).
 * Lançado sob demanda (não no topo do módulo) para não quebrar o build
 * quando MERCADOPAGO_ACCESS_TOKEN ainda não está configurado — o app
 * continua funcionando com PAYMENTS_ENABLED=false até lá.
 */
export function getPreApprovalClient(): PreApproval {
  return new PreApproval(new MercadoPagoConfig({ accessToken: requireAccessToken() }));
}

/**
 * Cliente para os planos (templates de assinatura) — ver
 * lib/subscriptions.ts > getMercadoPagoPlanId. O checkout de cartão
 * redireciona para o init_point do PLANO, não cria uma PreApproval avulsa
 * via API (isso exige card_token_id e não é o fluxo hospedado normal).
 */
export function getPreApprovalPlanClient(): PreApprovalPlan {
  return new PreApprovalPlan(new MercadoPagoConfig({ accessToken: requireAccessToken() }));
}

/**
 * Cliente do Mercado Pago para pagamentos avulsos (Pix). Sem débito
 * automático — cada ciclo da assinatura gera um Payment novo.
 */
export function getPaymentClient(): Payment {
  return new Payment(new MercadoPagoConfig({ accessToken: requireAccessToken() }));
}
