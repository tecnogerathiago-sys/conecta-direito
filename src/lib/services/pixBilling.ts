import { PrismaClient } from "@prisma/client";
import { getPaymentClient } from "@/lib/mercadopago";

// Pix não tem débito automático — cada QR code fica válido por um tempo,
// depois disso a cobrança expira e (se ainda dentro da assinatura) uma
// nova é gerada pelo job de renovação.
const PIX_EXPIRATION_HOURS = 48;

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
