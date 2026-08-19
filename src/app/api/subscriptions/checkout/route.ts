import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlanDefinition } from "@/lib/subscriptions";

const checkoutSchema = z.object({
  plan: z.enum(["BASICO", "PRO"]),
});

/**
 * Inicia a assinatura de um plano. Cria uma Subscription PENDING e devolve
 * a URL de checkout do gateway de pagamento (Pix / cartão, recorrente).
 *
 * A confirmação real do primeiro pagamento — e das renovações seguintes —
 * chega via webhook do gateway em /api/payments/webhook, que é quem marca
 * a assinatura como ACTIVE. Esta rota nunca ativa acesso diretamente.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "LAWYER") {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
  }

  const planDef = getPlanDefinition(parsed.data.plan);

  const subscription = await prisma.subscription.create({
    data: {
      lawyerId: session.user.id,
      plan: planDef.plan,
      priceBRL: planDef.priceBRL,
      status: "PENDING",
      paymentProvider: "mercadopago", // TODO: confirmar após integração real
    },
  });

  // TODO: substituir pela criação real de uma assinatura recorrente no
  // Mercado Pago (Checkout Pro / preapproval) e usar a init_point retornada.
  const paymentUrl = `https://checkout.gateway.example/${subscription.id}`;

  return NextResponse.json({ subscriptionId: subscription.id, paymentUrl }, { status: 201 });
}
