import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createLeadSchema } from "@/lib/validations";
import { computeLeadCoinCost } from "@/lib/pricing";
import { MAX_UNLOCKS_PER_LEAD } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = createLeadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const client = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!client) {
    return NextResponse.json({ error: "Conta não encontrada." }, { status: 401 });
  }

  const data = parsed.data;
  const coinCost = computeLeadCoinCost(data.legalArea, data.urgency);

  const lead = await prisma.lead.create({
    data: {
      clientId: client.id,
      // Retrato dos dados de contato no momento do envio (ver comentário no schema).
      fullName: client.name,
      cpf: client.cpf ?? "",
      birthDate: client.birthDate ?? new Date(0),
      phone: client.phone ?? "",
      email: client.email,
      legalArea: data.legalArea,
      description: data.description,
      urgency: data.urgency,
      city: data.city,
      state: data.state,
      coinCost,
      maxUnlocks: MAX_UNLOCKS_PER_LEAD,
    },
    select: { id: true },
  });

  return NextResponse.json({ id: lead.id }, { status: 201 });
}
