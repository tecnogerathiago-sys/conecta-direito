import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPreApprovalClient } from "@/lib/mercadopago";
import { isValidWebhookSignature } from "@/lib/services/mercadopagoWebhook";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Endpoint chamado pelo Mercado Pago quando uma assinatura (preapproval) é
 * autorizada, pausada ou cancelada — inclusive na primeira autorização e em
 * cada renovação. Ativa/renova a Subscription de forma idempotente; nunca
 * confia no corpo da notificação sozinho, sempre confirma buscando o estado
 * atual da assinatura direto na API do Mercado Pago.
 */
export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null);
  const type = payload?.type;
  const dataId: string | undefined = payload?.data?.id ? String(payload.data.id) : undefined;

  // Ignora silenciosamente notificações de outros tipos (ex: "payment"
  // avulso) — só nos interessa o ciclo de vida da assinatura em si.
  if (!dataId || (type !== "preapproval" && type !== "subscription_preapproval")) {
    return NextResponse.json({ ok: true });
  }

  const validSignature = isValidWebhookSignature({
    signatureHeader: req.headers.get("x-signature"),
    requestId: req.headers.get("x-request-id"),
    dataId,
    secret: process.env.MERCADOPAGO_WEBHOOK_SECRET,
  });
  if (!validSignature) {
    return NextResponse.json({ error: "Assinatura de webhook inválida." }, { status: 401 });
  }

  const preApproval = await getPreApprovalClient().get({ id: dataId });
  const subscriptionId = preApproval.external_reference;
  if (!subscriptionId) return NextResponse.json({ ok: true });

  await prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.findUnique({ where: { id: subscriptionId } });
    if (!subscription || subscription.status === "CANCELED") return;

    if (preApproval.status === "authorized") {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: { status: "ACTIVE", renewsAt: new Date(Date.now() + THIRTY_DAYS_MS) },
      });
    } else if (preApproval.status === "paused") {
      await tx.subscription.update({ where: { id: subscription.id }, data: { status: "PAST_DUE" } });
    } else if (preApproval.status === "cancelled") {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: { status: "CANCELED", canceledAt: new Date() },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
