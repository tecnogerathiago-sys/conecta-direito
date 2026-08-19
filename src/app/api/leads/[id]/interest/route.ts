import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { manifestInterest, ServiceError } from "@/lib/services/interests";

/**
 * Advogado manifesta interesse em uma causa. Ver lib/services/interests.ts
 * para a lógica de negócio (assinatura ativa, limite de vagas, notificação).
 */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "LAWYER") {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const manifestation = await manifestInterest(prisma, {
      leadId: params.id,
      lawyerId: session.user.id,
    });
    return NextResponse.json(
      { id: manifestation.id, status: manifestation.status },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao manifestar interesse." }, { status: 500 });
  }
}
