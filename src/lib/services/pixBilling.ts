import { PrismaClient, SubscriptionPaymentStatus } from "@prisma/client";
import { getPaymentClient } from "@/lib/mercadopago";

// Pix não tem débito automático — cada QR code fica válido por um tempo,
// depois disso a cobrança expira e (se ainda dentro da assinatura) uma
// nova é gerada pelo job de renovação.
const PIX_EXPIRATION_HOURS = 48;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Cria uma cobrança Pix avulsa (Mercado Pago Payment, não PreApproval) para
 * um ciclo de uma assinatura. Grava o SubscriptionPayment como PENDING
 * antes de chamar a API — se a chamada falhar, marca FAILED em vez de
 * deixar um registro órfão sem nenhum estado.
 */
export async function createPixCharge(
  prisma: PrismaClient,
  params: { subscriptionId: string; amountBRL: number; payerEmail: string; description: string }
) {
  const { subscriptionId, amountBRL, payerEmail, description } = params;
  const dueDate = new Date(Date.now() + PIX_EXPIRATION_HOURS * 60 * 60 * 1000);

  const pending = await prisma.subscriptionPayment.create({
    data: { subscriptionId, amountBRL, dueDate, status: "PENDING" },
  });

  try {
    const payment = await getPaymentClient().create({
      body: {
        transaction_amount: amountBRL,
        payment_method_id: "pix",
        description,
        payer: { email: payerEmail },
        external_reference: pending.id,
        date_of_expiration: dueDate.toISOString(),
      },
    });

    const qrCode = payment.point_of_interaction?.transaction_data?.qr_code;
    const qrCodeBase64 = payment.point_of_interaction?.transaction_data?.qr_code_base64;

    return await prisma.subscriptionPayment.update({
      where: { id: pending.id },
      data: {
        externalPaymentId: payment.id ? String(payment.id) : undefined,
        pixQrCode: qrCode,
        pixQrCodeBase64: qrCodeBase64,
      },
    });
  } catch (err) {
    await prisma.subscriptionPayment.update({ where: { id: pending.id }, data: { status: "FAILED" } });
    throw err;
  }
}

/**
 * Confirma o status real de um pagamento Pix direto na API do Mercado Pago
 * (nunca confia em payload de webhook nem no que já está no banco) e
 * aplica a transição de status correspondente. Usada tanto pelo webhook
 * (que já sabe o id do Payment) quanto pela verificação manual que o
 * advogado pode disparar no dashboard — cobre o caso do webhook não
 * chegar (evento não configurado no painel do Mercado Pago, instabilidade,
 * etc.), que já aconteceu em produção.
 */
export async function syncPixPaymentByExternalId(
  prisma: PrismaClient,
  externalPaymentId: string
): Promise<{ status: SubscriptionPaymentStatus } | null> {
  const payment = await getPaymentClient().get({ id: Number(externalPaymentId) });
  if (payment.payment_method_id !== "pix") return null;

  const subscriptionPaymentId = payment.external_reference;
  if (!subscriptionPaymentId) return null;

  return prisma.$transaction(async (tx) => {
    const subPayment = await tx.subscriptionPayment.findUnique({
      where: { id: subscriptionPaymentId },
      include: { subscription: true },
    });
    if (!subPayment) return null;
    if (subPayment.status !== "PENDING") return { status: subPayment.status };

    if (payment.status === "approved") {
      const paidAt = new Date();
      await tx.subscriptionPayment.update({
        where: { id: subPayment.id },
        data: { status: "PAID", paidAt, externalPaymentId },
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
      return { status: "PAID" as const };
    }

    if (payment.status === "rejected" || payment.status === "cancelled") {
      await tx.subscriptionPayment.update({
        where: { id: subPayment.id },
        data: { status: "FAILED", externalPaymentId },
      });
      return { status: "FAILED" as const };
    }

    return { status: "PENDING" as const };
  });
}
