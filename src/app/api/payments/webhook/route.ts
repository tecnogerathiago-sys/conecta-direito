import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Endpoint chamado pelo gateway de pagamento quando um Pix/cartão é
 * confirmado. Credita as moedas ao advogado de forma idempotente.
 *
 * TODO: validar a assinatura do webhook usando PAYMENT_PROVIDER_WEBHOOK_SECRET
 * antes de confiar no payload — implementação específica do gateway escolhido.
 */
export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null);
  const transactionId: string | undefined = payload?.transactionId;
  const status: string | undefined = payload?.status; // "paid" | "failed"
  const externalPaymentId: string | undefined = payload?.externalPaymentId;

  if (!transactionId || !status) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction || transaction.type !== "PURCHASE") return;
    if (transaction.paymentStatus !== "PENDING") return; // já processado, ignora

    if (status === "paid") {
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { paymentStatus: "PAID", externalPaymentId },
      });
      await tx.user.update({
        where: { id: transaction.userId },
        data: { coinBalance: { increment: transaction.coinAmount } },
      });
    } else {
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { paymentStatus: "FAILED", externalPaymentId },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
