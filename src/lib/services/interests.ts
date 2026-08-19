import { PrismaClient } from "@prisma/client";
import { caseCodeFor } from "@/lib/masking";

export class ServiceError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

/**
 * Advogado manifesta interesse em uma causa. Não revela contato — só
 * registra o interesse e notifica o cliente. Exige assinatura ativa:
 * acesso à plataforma vem da assinatura, não da manifestação em si.
 * Idempotente: manifestar de novo na mesma causa apenas retorna a
 * manifestação já existente.
 */
export async function manifestInterest(
  prisma: PrismaClient,
  params: { leadId: string; lawyerId: string }
) {
  const { leadId, lawyerId } = params;

  return prisma.$transaction(async (tx) => {
    const activeSubscription = await tx.subscription.findFirst({
      where: { lawyerId, status: "ACTIVE" },
    });
    if (!activeSubscription) {
      throw new ServiceError(402, "Você precisa de uma assinatura ativa para manifestar interesse.");
    }

    const lead = await tx.lead.findUnique({
      where: { id: leadId },
      include: { interests: true },
    });
    if (!lead) throw new ServiceError(404, "Causa não encontrada.");

    const existing = lead.interests.find((i) => i.lawyerId === lawyerId);
    if (existing) return existing;

    if (lead.interests.length >= lead.maxInterests) {
      throw new ServiceError(409, "Esta causa já atingiu o limite de advogados interessados.");
    }

    const created = await tx.interestManifestation.create({
      data: { leadId: lead.id, lawyerId },
    });

    if (lead.clientId) {
      await tx.notification.create({
        data: {
          userId: lead.clientId,
          type: "LAWYER_INTEREST",
          message: `Um advogado manifestou interesse no seu ${caseCodeFor(lead.id)}.`,
          leadId: lead.id,
        },
      });
    }

    const interestCount = lead.interests.length + 1;
    if (interestCount >= lead.maxInterests) {
      await tx.lead.update({ where: { id: lead.id }, data: { status: "CLOSED" } });
    }

    return created;
  });
}

/**
 * O cliente aceita ou recusa liberar seu contato para um advogado
 * específico que manifestou interesse. Única forma de o contato ser
 * revelado — nunca automaticamente, nunca por pagamento do advogado.
 */
export async function respondToInterest(
  prisma: PrismaClient,
  params: { interestId: string; clientId: string; decision: "accept" | "decline" }
) {
  const { interestId, clientId, decision } = params;

  const manifestation = await prisma.interestManifestation.findUnique({
    where: { id: interestId },
    include: { lead: true },
  });

  if (!manifestation || manifestation.lead.clientId !== clientId) {
    throw new ServiceError(404, "Manifestação não encontrada.");
  }
  if (manifestation.status !== "PENDING") {
    throw new ServiceError(409, "Esta manifestação já foi respondida.");
  }

  const accept = decision === "accept";

  return prisma.$transaction(async (tx) => {
    const result = await tx.interestManifestation.update({
      where: { id: manifestation.id },
      data: {
        status: accept ? "ACCEPTED" : "DECLINED",
        respondedAt: new Date(),
        contactReleasedAt: accept ? new Date() : null,
      },
    });

    await tx.notification.create({
      data: {
        userId: manifestation.lawyerId,
        type: accept ? "CONTACT_ACCEPTED" : "CONTACT_DECLINED",
        message: accept
          ? `O cliente liberou o contato do ${caseCodeFor(manifestation.leadId)}.`
          : `O cliente optou por não liberar o contato do ${caseCodeFor(manifestation.leadId)}.`,
        leadId: manifestation.leadId,
      },
    });

    return result;
  });
}
