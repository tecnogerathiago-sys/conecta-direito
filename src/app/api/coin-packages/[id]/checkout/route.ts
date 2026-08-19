import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { totalCoinsForPackage } from "@/lib/pricing";

/**
 * Inicia a compra de um pacote de moedas. Cria uma Transaction PENDING e
 * devolve a URL de checkout do gateway de pagamento (Pix / Cartão).
 *
 * A confirmação real do pagamento chega depois, via webhook do gateway
 * em /api/payments/webhook — é lá que as moedas são creditadas. Esta rota
 * nunca credita moedas diretamente.
 */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const pkg = await prisma.coinPackage.findUnique({ where: { id: params.id } });
  if (!pkg || !pkg.isActive) {
    return NextResponse.json({ error: "Pacote não encontrado." }, { status: 404 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId: session.user.id,
      type: "PURCHASE",
      coinAmount: totalCoinsForPackage(pkg.coinAmount, pkg.bonusCoins),
      amountBRL: pkg.priceBRL,
      coinPackageId: pkg.id,
      paymentStatus: "PENDING",
      paymentProvider: "pix", // TODO: permitir escolha entre pix/credit_card
    },
  });

  // TODO: substituir pelo SDK real do gateway de pagamento (ex: Stripe, Pagar.me, Mercado Pago).
  const paymentUrl = `https://checkout.gateway.example/${transaction.id}`;

  return NextResponse.json({ transactionId: transaction.id, paymentUrl }, { status: 201 });
}
