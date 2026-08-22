import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPreApprovalClient } from "@/lib/mercadopago";
import { isValidWebhookSignature } from "@/lib/services/mercadopagoWebhook";
import { syncPixPaymentByExternalId } from "@/lib/services/pixBilling";

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
 * Confirma um pagamento Pix avulso (um ciclo da assinatura). A lógica de
 * buscar o Payment real na API e aplicar a transição de status vive em
 * lib/services/pixBilling.ts — compartilhada com a verificação manual que
 * o advogado pode disparar no dashboard (fallback para quando este webhook
 * não chega).
 */
async function handlePaymentNotification(dataId: string) {
  await syncPixPaymentByExternalId(prisma, dataId);
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
