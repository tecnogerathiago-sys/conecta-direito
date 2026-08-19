import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlanDefinition } from "@/lib/subscriptions";
import { getPreApprovalClient } from "@/lib/mercadopago";
import { PAYMENTS_ENABLED } from "@/lib/constants";

const checkoutSchema = z.object({
  plan: z.enum(["BASICO", "PRO"]),
});

/**
 * Inicia a assinatura de um plano: cria uma Subscription PENDING e uma
 * assinatura recorrente (PreApproval) no Mercado Pago, devolvendo a
 * `init_point` — URL onde o advogado autoriza a cobrança recorrente.
 *
 * A confirmação (autorização, cobranças futuras, cancelamento) chega via
 * webhook em /api/payments/webhook, que é quem marca a assinatura como
 * ACTIVE/PAST_DUE/CANCELED. Esta rota nunca ativa acesso diretamente.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "LAWYER") {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  if (!PAYMENTS_ENABLED) {
    return NextResponse.json({ error: "Pagamentos ainda não estão habilitados." }, { status: 503 });
  }

  const json = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
  }

  const lawyer = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!lawyer) {
    return NextResponse.json({ error: "Conta não encontrada." }, { status: 401 });
  }

  const planDef = getPlanDefinition(parsed.data.plan);

  const subscription = await prisma.subscription.create({
    data: {
      lawyerId: lawyer.id,
      plan: planDef.plan,
      priceBRL: planDef.priceBRL,
      status: "PENDING",
      paymentProvider: "mercadopago",
    },
  });

  try {
    const preApproval = await getPreApprovalClient().create({
      body: {
        reason: `Conecta Direito — Plano ${planDef.name}`,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: planDef.priceBRL,
          currency_id: "BRL",
        },
        back_url: `${process.env.NEXTAUTH_URL}/advogado/assinatura`,
        payer_email: lawyer.email,
        external_reference: subscription.id,
        status: "pending",
      },
    });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { externalSubscriptionId: preApproval.id },
    });

    return NextResponse.json(
      { subscriptionId: subscription.id, paymentUrl: preApproval.init_point },
      { status: 201 }
    );
  } catch (err) {
    await prisma.subscription.update({ where: { id: subscription.id }, data: { status: "CANCELED" } });
    console.error(err);
    return NextResponse.json(
      { error: "Não foi possível iniciar a assinatura no gateway de pagamento." },
      { status: 502 }
    );
  }
}
