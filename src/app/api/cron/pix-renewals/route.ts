import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPixCharge } from "@/lib/services/pixBilling";

const RENEWAL_WINDOW_DAYS = 3; // gera o Pix do próximo ciclo com essa antecedência
const GRACE_PERIOD_DAYS = 5; // depois disso sem pagar, assinatura fica atrasada

/**
 * Job diário (Vercel Cron, ver vercel.json) que substitui o débito
 * automático que o cartão tem — como Pix não recarrega sozinho:
 *
 * 1. Gera um novo QR code Pix para assinaturas Pix ativas que estão perto
 *    de vencer (e ainda não têm uma cobrança pendente para o ciclo).
 * 2. Marca como PAST_DUE quem passou do período de tolerância sem pagar.
 *
 * Protegido por CRON_SECRET — Vercel injeta esse header automaticamente
 * em chamadas agendadas quando a env var tem esse nome exato.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const now = Date.now();
  const renewalCutoff = new Date(now + RENEWAL_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const graceCutoff = new Date(now - GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);

  const dueForRenewal = await prisma.subscription.findMany({
    where: {
      paymentMethod: "PIX",
      status: "ACTIVE",
      renewsAt: { lte: renewalCutoff },
      payments: { none: { status: "PENDING" } },
    },
    include: { lawyer: true },
  });

  let charged = 0;
  for (const subscription of dueForRenewal) {
    try {
      await createPixCharge(prisma, {
        subscriptionId: subscription.id,
        amountBRL: Number(subscription.priceBRL),
        payerEmail: subscription.lawyer.email,
        description: `Conecta Direito — renovação (${subscription.plan})`,
      });
      await prisma.notification.create({
        data: {
          userId: subscription.lawyerId,
          type: "PIX_PAYMENT_DUE",
          message: "Sua assinatura está próxima do vencimento — pague o Pix para continuar ativa.",
        },
      });
      charged++;
    } catch (err) {
      console.error(`Falha ao gerar Pix de renovação para subscription ${subscription.id}`, err);
    }
  }

  const pastDue = await prisma.subscription.updateMany({
    where: { paymentMethod: "PIX", status: "ACTIVE", renewsAt: { lt: graceCutoff } },
    data: { status: "PAST_DUE" },
  });

  return NextResponse.json({ ok: true, charged, markedPastDue: pastDue.count });
}
