import { MercadoPagoConfig, PreApproval } from "mercadopago";

/**
 * Cliente do Mercado Pago para assinaturas recorrentes (PreApproval).
 * Lançado sob demanda (não no topo do módulo) para não quebrar o build
 * quando MERCADOPAGO_ACCESS_TOKEN ainda não está configurado — o app
 * continua funcionando com PAYMENTS_ENABLED=false até lá.
 */
export function getPreApprovalClient(): PreApproval {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      "MERCADOPAGO_ACCESS_TOKEN não configurado. Defina a variável de ambiente antes de habilitar PAYMENTS_ENABLED."
    );
  }
  const config = new MercadoPagoConfig({ accessToken });
  return new PreApproval(config);
}
