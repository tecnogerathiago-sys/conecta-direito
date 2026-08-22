import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPreApprovalClient, getPaymentClient } from "@/lib/mercadopago";
import { isValidWebhookSignature } from "@/lib/services/mercadopagoWebhook";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

async function handlePreapprovalNotification(dataId: string) {
  const preApproval = await getPreApprovalClient().get({ id: dataId });

  await prisma.$transaction(async (tx) => {
    let subscription = preApproval.external_reference
      ? await tx.subscription.findUnique({ where: { id: preApproval.external_reference } })
      : null;

    // O checkout de plano nem sempre repassa external_reference (não é
    // comportamento documentado) — nesse caso, acha a assinatura PENDING
    // mais recente desse advogado com o mesmo plano como melhor esforço.
    if (!subscription && preApproval.payer_email) {
      const lawyer = await tx.user.findUnique({ where: { email: preApproval.payer_email } });
      if (lawyer) {
        subscription = await tx.subscription.findFirst({
          where: { lawyerId: lawyer.id, paymentMethod: "CARD", status: "PENDING" },
          orderBy: { createdAt: "desc" },
        });
      }
    }

    if (!subscription || subscription.status === "CANCELED") return;

    if (preApproval.status === "authorized") {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "ACTIVE",
          renewsAt: new Date(Date.now() + THIRTY_DAYS_MS),
          externalSubscriptionId: dataId,
        },
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
}

/**
 * Confirma um pagamento Pix avulso (um ciclo da assinatura). Nunca confia
 * no corpo da notificação — sempre busca o Payment na API do Mercado Pago
 * pra saber o status real antes de liberar acesso.
 */
async function handlePaymentNotification(dataId: string) {
  const payment = await getPaymentClient().get({ id: Number(dataId) });
  if (payment.payment_method_id !== "pix") return;

  const subscriptionPaymentId = payment.external_reference;
  if (!subscriptionPaymentId) return;

  await prisma.$transaction(async (tx) => {
    const subPayment = await tx.subscriptionPayment.findUnique({
      where: { id: subscriptionPaymentId },
      include: { subscription: true },
    });
    if (!subPayment || subPayment.status !== "PENDING") return;

    if (payment.status === "approved") {
      const paidAt = new Date();
      await tx.subscriptionPayment.update({
        where: { id: subPayment.id },
        data: { status: "PAID", paidAt, externalPaymentId: dataId },
      });
      await tx.subscription.update({
        where: { id: subPayment.subscriptionId },
        data: { status: "ACTIVE", renewsAt: new Date(paidAt.getTime() + THIRTY_DAYS_MS) },
      });
      await tx.notification.create({
        data: {
          userId: subPayment.subscription.lawyerId,
          type: "PIX_PAYMENT_RECEIVED",
          message: "Seu Pix foi confirmado e a assinatura foi renovada.",
        },
      });
    } else if (payment.status === "rejected" || payment.status === "cancelled") {
      await tx.subscriptionPayment.update({
        where: { id: subPayment.id },
        data: { status: "FAILED", externalPaymentId: dataId },
      });
    }
  });
}

/**
 * Endpoint chamado pelo Mercado Pago para dois tipos de evento:
 *
 * - `preapproval` — assinatura via cartão autorizada, pausada ou cancelada.
 * - `payment` — cobrança Pix avulsa aprovada/rejeitada.
 *
 * Sempre confirma buscando o estado atual direto na API do Mercado Pago
 * antes de mudar qualquer coisa — nunca confia só no corpo da notificação.
 */
export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null);
  const type = payload?.type;
  const dataId: string | undefined = payload?.data?.id ? String(payload.data.id) : undefined;

  const isPreapproval = type === "preapproval" || type === "subscription_preapproval";
  const isPayment = type === "payment";

  if (!dataId || (!isPreapproval && !isPayment)) {
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

  if (isPreapproval) {
    await handlePreapprovalNotification(dataId);
  } else {
    await handlePaymentNotification(dataId);
  }

  return NextResponse.json({ ok: true });
}
