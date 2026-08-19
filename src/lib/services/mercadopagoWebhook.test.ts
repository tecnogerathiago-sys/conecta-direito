import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { isValidWebhookSignature } from "./mercadopagoWebhook";

const SECRET = "0b02855fe0e420c65f87e627b4a1b513f3cf164c7b09f948d37f8f511c2c72c1";

function sign(dataId: string, requestId: string, ts: string, secret = SECRET) {
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  return crypto.createHmac("sha256", secret).update(manifest).digest("hex");
}

describe("isValidWebhookSignature", () => {
  it("aceita uma assinatura corretamente calculada", () => {
    const dataId = "123456789";
    const requestId = "req-abc-1";
    const ts = "1700000000000";
    const hash = sign(dataId, requestId, ts);

    const result = isValidWebhookSignature({
      signatureHeader: `ts=${ts},v1=${hash}`,
      requestId,
      dataId,
      secret: SECRET,
    });

    expect(result).toBe(true);
  });

  it("recusa quando o hash não bate (payload adulterado ou segredo errado)", () => {
    const dataId = "123456789";
    const requestId = "req-abc-1";
    const ts = "1700000000000";
    const hash = sign(dataId, requestId, ts, "segredo-errado");

    const result = isValidWebhookSignature({
      signatureHeader: `ts=${ts},v1=${hash}`,
      requestId,
      dataId,
      secret: SECRET,
    });

    expect(result).toBe(false);
  });

  it("recusa quando dataId foi trocado (o hash foi calculado pra outro id)", () => {
    const requestId = "req-abc-1";
    const ts = "1700000000000";
    const hash = sign("id-original", requestId, ts);

    const result = isValidWebhookSignature({
      signatureHeader: `ts=${ts},v1=${hash}`,
      requestId,
      dataId: "id-trocado",
      secret: SECRET,
    });

    expect(result).toBe(false);
  });

  it("recusa sem segredo configurado (fail-closed)", () => {
    const dataId = "123456789";
    const requestId = "req-abc-1";
    const ts = "1700000000000";
    const hash = sign(dataId, requestId, ts);

    const result = isValidWebhookSignature({
      signatureHeader: `ts=${ts},v1=${hash}`,
      requestId,
      dataId,
      secret: undefined,
    });

    expect(result).toBe(false);
  });

  it("recusa sem header de assinatura", () => {
    const result = isValidWebhookSignature({
      signatureHeader: null,
      requestId: "req-abc-1",
      dataId: "123456789",
      secret: SECRET,
    });

    expect(result).toBe(false);
  });

  it("recusa sem x-request-id", () => {
    const dataId = "123456789";
    const ts = "1700000000000";
    const hash = sign(dataId, "req-abc-1", ts);

    const result = isValidWebhookSignature({
      signatureHeader: `ts=${ts},v1=${hash}`,
      requestId: null,
      dataId,
      secret: SECRET,
    });

    expect(result).toBe(false);
  });
});
