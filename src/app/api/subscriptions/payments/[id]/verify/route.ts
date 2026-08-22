import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncPixPaymentByExternalId } from "@/lib/services/pixBilling";

/**
 * Fallback para quando o webhook do Mercado Pago não chega (evento não
 * configurado no painel, instabilidade, etc.) — permite ao próprio
 * advogado disparar a confirmação de um Pix já pago em vez de ficar preso
 * em PENDING indefinidamente. Reaproveita a mesma lógica de sincronização
 * usada pelo webhook (lib/services/pixBilling.ts).
 */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "LAWYER") {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const subPayment = await prisma.subscriptionPayment.findUnique({
    where: { id: params.id },
    include: { subscription: true },
  });

  if (!subPayment || subPayment.subscription.lawyerId !== session.user.id) {
    return NextResponse.json({ error: "Cobrança não encontrada." }, { status: 404 });
  }

  if (subPayment.status !== "PENDING") {
    return NextResponse.json({ status: subPayment.status });
  }
  if (!subPayment.externalPaymentId) {
    return NextResponse.json({ status: "PENDING" });
  }

  try {
    const result = await syncPixPaymentByExternalId(prisma, subPayment.externalPaymentId);
    return NextResponse.json({ status: result?.status ?? "PENDING" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Não foi possível verificar o pagamento agora." }, { status: 502 });
  }
}
