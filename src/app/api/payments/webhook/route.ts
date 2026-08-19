import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Endpoint chamado pelo gateway de pagamento quando uma cobrança da
 * assinatura (inicial ou renovação) é confirmada ou falha. Ativa/renova a
 * assinatura de forma idempotente — nunca dá acesso à plataforma sem essa
 * confirmação.
 *
 * TODO: validar a assinatura do webhook (x-signature do Mercado Pago) usando
 * PAYMENT_PROVIDER_WEBHOOK_SECRET antes de confiar no payload.
 */
export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null);
  const subscriptionId: string | undefined = payload?.subscriptionId;
  const status: string | undefined = payload?.status; // "paid" | "failed"
  const externalSubscriptionId: string | undefined = payload?.externalSubscriptionId;

  if (!subscriptionId || !status) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.findUnique({ where: { id: subscriptionId } });
    if (!subscription || subscription.status === "CANCELED") return;

    if (status === "paid") {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "ACTIVE",
          renewsAt: new Date(Date.now() + THIRTY_DAYS_MS),
          externalSubscriptionId: externalSubscriptionId ?? subscription.externalSubscriptionId,
        },
      });
    } else {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: { status: subscription.status === "ACTIVE" ? "PAST_DUE" : "CANCELED" },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
