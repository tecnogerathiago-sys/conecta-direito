import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { respondToInterest, ServiceError } from "@/lib/services/interests";

const respondSchema = z.object({
  decision: z.enum(["accept", "decline"]),
});

/**
 * O cliente aceita ou recusa liberar seu contato para um advogado. Ver
 * lib/services/interests.ts para a lógica de negócio.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = respondSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Decisão inválida." }, { status: 400 });
  }

  try {
    const updated = await respondToInterest(prisma, {
      interestId: params.id,
      clientId: session.user.id,
      decision: parsed.data.decision,
    });
    return NextResponse.json({ status: updated.status }, { status: 200 });
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao registrar resposta." }, { status: 500 });
  }
}
