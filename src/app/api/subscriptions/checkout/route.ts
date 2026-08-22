import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlanDefinition, getMercadoPagoPlanId } from "@/lib/subscriptions";
import { getPreApprovalPlanClient } from "@/lib/mercadopago";
import { createPixCharge } from "@/lib/services/pixBilling";
import { PAYMENTS_ENABLED } from "@/lib/constants";

const checkoutSchema = z.object({
  plan: z.enum(["BASICO", "PRO"]),
  method: z.enum(["card", "pix"]),
});

/**
 * Inicia a assinatura de um plano.
 *
 * - `method: "card"` — devolve o `init_point` do plano de assinatura já
 *   cadastrado no Mercado Pago (ver lib/subscriptions.ts). Não criamos uma
 *   PreApproval avulsa via API: para planos, isso exige card_token_id e
 *   não é o fluxo hospedado; o próprio Mercado Pago cria a PreApproval
 *   quando o advogado autoriza pela tela deles.
 * - `method: "pix"` — sem débito automático: gera um Payment avulso com
 *   QR code Pix para o ciclo atual. As renovações seguintes são geradas
 *   pelo job em /api/cron/pix-renewals conforme a assinatura se aproxima
 *   do vencimento.
 *
 * Em ambos os casos a confirmação chega via webhook em
 * /api/payments/webhook — esta rota nunca ativa acesso diretamente.
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
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const lawyer = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!lawyer) {
    return NextResponse.json({ error: "Conta não encontrada." }, { status: 401 });
  }

  const planDef = getPlanDefinition(parsed.data.plan);

  if (parsed.data.method === "pix") {
    const subscription = await prisma.subscription.create({
      data: {
        lawyerId: lawyer.id,
        plan: planDef.plan,
        priceBRL: planDef.priceBRL,
        status: "PENDING",
        paymentMethod: "PIX",
        paymentProvider: "mercadopago",
      },
    });

    try {
      const payment = await createPixCharge(prisma, {
        subscriptionId: subscription.id,
        amountBRL: planDef.priceBRL,
        payerEmail: lawyer.email,
        description: `Conecta Direito — Plano ${planDef.name}`,
      });

      return NextResponse.json(
        {
          method: "pix",
          subscriptionId: subscription.id,
          payment: {
            id: payment.id,
            qrCode: payment.pixQrCode,
            qrCodeBase64: payment.pixQrCodeBase64,
            dueDate: payment.dueDate,
          },
        },
        { status: 201 }
      );
    } catch (err) {
      await prisma.subscription.update({ where: { id: subscription.id }, data: { status: "CANCELED" } });
      console.error(err);
      return NextResponse.json({ error: "Não foi possível gerar o Pix." }, { status: 502 });
    }
  }

  const subscription = await prisma.subscription.create({
    data: {
      lawyerId: lawyer.id,
      plan: planDef.plan,
      priceBRL: planDef.priceBRL,
      status: "PENDING",
      paymentMethod: "CARD",
      paymentProvider: "mercadopago",
    },
  });

  try {
    const plan = await getPreApprovalPlanClient().get({
      preApprovalPlanId: getMercadoPagoPlanId(planDef.plan),
    });
    if (!plan.init_point) throw new Error("Plano sem init_point configurado no Mercado Pago.");

    // O checkout hospedado do Mercado Pago lê external_reference da query
    // string quando presente; mesmo assim o webhook tem um fallback (achar
    // a Subscription PENDING mais recente do advogado por e-mail), já que
    // isso não é comportamento oficialmente documentado.
    const paymentUrl = `${plan.init_point}&external_reference=${encodeURIComponent(subscription.id)}`;

    return NextResponse.json({ method: "card", subscriptionId: subscription.id, paymentUrl }, { status: 201 });
  } catch (err) {
    await prisma.subscription.update({ where: { id: subscription.id }, data: { status: "CANCELED" } });
    console.error(err);
    return NextResponse.json(
      { error: "Não foi possível iniciar a assinatura no gateway de pagamento." },
      { status: 502 }
    );
  }
}
