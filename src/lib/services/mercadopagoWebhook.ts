import crypto from "crypto";

/**
 * Valida o header `x-signature` do Mercado Pago: HMAC-SHA256 sobre
 * `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`, usando o segredo de
 * webhook configurado no painel do app (aba Webhooks > "Assinatura secreta").
 *
 * Pura e sem dependência de NextRequest de propósito — assim dá pra testar
 * sem precisar montar um request HTTP fake.
 *
 * https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/notifications/webhooks
 */
export function isValidWebhookSignature(params: {
  signatureHeader: string | null;
  requestId: string | null;
  dataId: string;
  secret: string | undefined;
}): boolean {
  const { signatureHeader, requestId, dataId, secret } = params;
  if (!secret || !signatureHeader || !requestId) return false;

  const parts: Record<string, string> = {};
  for (const part of signatureHeader.split(",")) {
    const [key, value] = part.split("=");
    if (key && value) parts[key.trim()] = value.trim();
  }
  const { ts, v1: hash } = parts;
  if (!ts || !hash) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const computed = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  const computedBuffer = Buffer.from(computed, "hex");
  const hashBuffer = Buffer.from(hash, "hex");
  if (computedBuffer.length !== hashBuffer.length) return false;

  return crypto.timingSafeEqual(computedBuffer, hashBuffer);
}
