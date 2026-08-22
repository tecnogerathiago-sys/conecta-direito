import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { lawyerSignupSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = lawyerSignupSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const passwordHash = await bcrypt.hash(data.password, 10);

  try {
    const lawyer = await prisma.user.create({
      data: {
        role: "LAWYER",
        name: data.fullName,
        email: data.email,
        passwordHash,
        phone: data.phone,
        oabNumber: data.oabNumber,
        oabState: data.oabState,
        areasOfPractice: data.areasOfPractice,
        activeRegions: [data.activeRegion],
      },
      select: { id: true },
    });

    return NextResponse.json({ id: lawyer.id }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const target = (err.meta?.target as string[] | undefined)?.join(", ");
      const field = target?.includes("oabNumber") ? "número de OAB" : "e-mail";
      return NextResponse.json({ error: `Já existe uma conta com esse ${field}.` }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar conta." }, { status: 500 });
  }
}
