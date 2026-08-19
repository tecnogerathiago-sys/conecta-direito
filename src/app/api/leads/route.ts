import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLeadSchema } from "@/lib/validations";
import { computeLeadCoinCost } from "@/lib/pricing";
import { MAX_UNLOCKS_PER_LEAD } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = createLeadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const coinCost = computeLeadCoinCost(data.legalArea, data.urgency);

  const lead = await prisma.lead.create({
    data: {
      fullName: data.fullName,
      cpf: data.cpf,
      birthDate: new Date(data.birthDate),
      phone: data.phone,
      email: data.email,
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
