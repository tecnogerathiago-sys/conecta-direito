import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toUnlockedLead } from "@/lib/masking";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const lawyerId = session.user.id;
  const leadId = params.id;

  try {
    // Serializable evita que dois advogados desbloqueiem simultaneamente
    // além do limite (maxUnlocks) em uma condição de corrida.
    const lead = await prisma.$transaction(
      async (tx) => {
        const lead = await tx.lead.findUnique({
          where: { id: leadId },
          include: { unlocks: true },
        });
        if (!lead) throw new ApiError(404, "Lead não encontrado.");

        const alreadyUnlocked = lead.unlocks.find((u) => u.lawyerId === lawyerId);
        if (alreadyUnlocked) return lead; // idempotente: já desbloqueado por este advogado

        if (lead.unlocks.length >= lead.maxUnlocks) {
          throw new ApiError(409, "Este lead já atingiu o limite de advogados.");
        }

        const lawyer = await tx.user.findUnique({ where: { id: lawyerId } });
        if (!lawyer) throw new ApiError(401, "Advogado não encontrado.");
        if (lawyer.coinBalance < lead.coinCost) {
          throw new ApiError(402, "Saldo de moedas insuficiente.");
        }

        await tx.user.update({
          where: { id: lawyerId },
          data: { coinBalance: { decrement: lead.coinCost } },
        });

        const unlock = await tx.leadUnlock.create({
          data: { leadId: lead.id, lawyerId, coinsSpent: lead.coinCost },
        });

        await tx.transaction.create({
          data: {
            userId: lawyerId,
            type: "UNLOCK_SPEND",
            coinAmount: -lead.coinCost,
            leadUnlockId: unlock.id,
          },
        });

        const unlockCount = lead.unlocks.length + 1;
        if (unlockCount >= lead.maxUnlocks) {
          await tx.lead.update({ where: { id: lead.id }, data: { status: "CLOSED" } });
        }

        return lead;
      },
      { isolationLevel: "Serializable" }
    );

    return NextResponse.json({ lead: toUnlockedLead(lead) }, { status: 200 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao desbloquear lead." }, { status: 500 });
  }
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}
