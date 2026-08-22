import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { lawyerProfileUpdateSchema } from "@/lib/validations";

async function requireLawyerSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "LAWYER") return null;
  return session;
}

export async function GET() {
  const session = await requireLawyerSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const lawyer = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      oabNumber: true,
      oabState: true,
      contactPhone: true,
      contactEmail: true,
      photoUrl: true,
      areasOfPractice: true,
      activeRegions: true,
    },
  });

  if (!lawyer) return NextResponse.json({ error: "Advogado não encontrado." }, { status: 404 });

  return NextResponse.json(lawyer);
}

export async function PATCH(req: NextRequest) {
  const session = await requireLawyerSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = lawyerProfileUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const lawyer = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.fullName,
      phone: data.phone,
      areasOfPractice: data.areasOfPractice,
      activeRegions: data.activeRegions,
      contactPhone: data.contactPhone || null,
      contactEmail: data.contactEmail || null,
      photoUrl: data.photoUrl || null,
    },
    select: {
      name: true,
      email: true,
      phone: true,
      oabNumber: true,
      oabState: true,
      contactPhone: true,
      contactEmail: true,
      photoUrl: true,
      areasOfPractice: true,
      activeRegions: true,
    },
  });

  return NextResponse.json(lawyer);
}
