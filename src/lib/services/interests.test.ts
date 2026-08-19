import { describe, it, expect, vi, beforeEach } from "vitest";
import { manifestInterest as manifestInterestImpl, respondToInterest as respondToInterestImpl, ServiceError } from "./interests";
import type { PrismaClient } from "@prisma/client";

/**
 * Mocks leves do Prisma — sem banco real. `$transaction` só executa o
 * callback recebido passando o mesmo mock, replicando o suficiente do
 * comportamento real para testar a lógica de negócio isoladamente.
 */
function createMockPrisma() {
  const mock = {
    subscription: { findFirst: vi.fn() },
    lead: { findUnique: vi.fn(), update: vi.fn() },
    interestManifestation: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    notification: { create: vi.fn() },
    $transaction: vi.fn((cb: (tx: typeof mock) => unknown) => cb(mock)),
  };
  return mock;
}

type MockPrisma = ReturnType<typeof createMockPrisma>;

// Wrappers finos só pra centralizar o cast pro tipo real do Prisma — os
// testes trabalham com o mock "cru" (com .mockResolvedValue etc acessível).
function manifestInterest(prisma: MockPrisma, params: { leadId: string; lawyerId: string }) {
  return manifestInterestImpl(prisma as unknown as PrismaClient, params);
}
function respondToInterest(
  prisma: MockPrisma,
  params: { interestId: string; clientId: string; decision: "accept" | "decline" }
) {
  return respondToInterestImpl(prisma as unknown as PrismaClient, params);
}

describe("manifestInterest", () => {
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = createMockPrisma();
  });

  it("recusa manifestar interesse sem assinatura ativa", async () => {
    prisma.subscription.findFirst.mockResolvedValue(null);

    await expect(manifestInterest(prisma, { leadId: "lead-1", lawyerId: "lawyer-1" })).rejects.toMatchObject(
      { status: 402 } satisfies Partial<ServiceError>
    );

    expect(prisma.lead.findUnique).not.toHaveBeenCalled();
  });

  it("recusa manifestar interesse em causa inexistente", async () => {
    prisma.subscription.findFirst.mockResolvedValue({ id: "sub-1" });
    prisma.lead.findUnique.mockResolvedValue(null);

    await expect(manifestInterest(prisma, { leadId: "lead-x", lawyerId: "lawyer-1" })).rejects.toMatchObject({
      status: 404,
    });
  });

  it("é idempotente: retorna a manifestação existente sem criar duplicata", async () => {
    const existing = { id: "interest-1", lawyerId: "lawyer-1", status: "PENDING" };
    prisma.subscription.findFirst.mockResolvedValue({ id: "sub-1" });
    prisma.lead.findUnique.mockResolvedValue({
      id: "lead-1",
      clientId: "client-1",
      maxInterests: 5,
      interests: [existing],
    });

    const result = await manifestInterest(prisma, { leadId: "lead-1", lawyerId: "lawyer-1" });

    expect(result).toBe(existing);
    expect(prisma.interestManifestation.create).not.toHaveBeenCalled();
  });

  it("recusa quando o limite de advogados interessados já foi atingido", async () => {
    prisma.subscription.findFirst.mockResolvedValue({ id: "sub-1" });
    prisma.lead.findUnique.mockResolvedValue({
      id: "lead-1",
      clientId: "client-1",
      maxInterests: 2,
      interests: [
        { id: "i1", lawyerId: "outro-1" },
        { id: "i2", lawyerId: "outro-2" },
      ],
    });

    await expect(manifestInterest(prisma, { leadId: "lead-1", lawyerId: "lawyer-1" })).rejects.toMatchObject({
      status: 409,
    });

    expect(prisma.interestManifestation.create).not.toHaveBeenCalled();
  });

  it("cria a manifestação e notifica o cliente, sem revelar contato", async () => {
    prisma.subscription.findFirst.mockResolvedValue({ id: "sub-1" });
    prisma.lead.findUnique.mockResolvedValue({
      id: "lead-1",
      clientId: "client-1",
      maxInterests: 5,
      interests: [],
    });
    const created = { id: "interest-new", status: "PENDING" };
    prisma.interestManifestation.create.mockResolvedValue(created);

    const result = await manifestInterest(prisma, { leadId: "lead-1", lawyerId: "lawyer-1" });

    expect(result).toBe(created);
    expect(prisma.interestManifestation.create).toHaveBeenCalledWith({
      data: { leadId: "lead-1", lawyerId: "lawyer-1" },
    });
    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "client-1", type: "LAWYER_INTEREST" }),
      })
    );
    // Nenhum dado de contato deve ser passado pra frente — a função nunca
    // toca em fullName/cpf/phone/email do Lead.
    expect(result).not.toHaveProperty("fullName");
  });

  it("fecha a causa quando a última vaga é preenchida", async () => {
    prisma.subscription.findFirst.mockResolvedValue({ id: "sub-1" });
    prisma.lead.findUnique.mockResolvedValue({
      id: "lead-1",
      clientId: "client-1",
      maxInterests: 1,
      interests: [],
    });
    prisma.interestManifestation.create.mockResolvedValue({ id: "interest-new", status: "PENDING" });

    await manifestInterest(prisma, { leadId: "lead-1", lawyerId: "lawyer-1" });

    expect(prisma.lead.update).toHaveBeenCalledWith({
      where: { id: "lead-1" },
      data: { status: "CLOSED" },
    });
  });
});

describe("respondToInterest", () => {
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = createMockPrisma();
  });

  it("recusa responder uma manifestação de outro cliente", async () => {
    prisma.interestManifestation.findUnique.mockResolvedValue({
      id: "interest-1",
      status: "PENDING",
      lawyerId: "lawyer-1",
      leadId: "lead-1",
      lead: { clientId: "client-dono" },
    });

    await expect(
      respondToInterest(prisma, { interestId: "interest-1", clientId: "client-invasor", decision: "accept" })
    ).rejects.toMatchObject({ status: 404 });

    expect(prisma.interestManifestation.update).not.toHaveBeenCalled();
  });

  it("recusa responder de novo uma manifestação já respondida", async () => {
    prisma.interestManifestation.findUnique.mockResolvedValue({
      id: "interest-1",
      status: "ACCEPTED",
      lawyerId: "lawyer-1",
      leadId: "lead-1",
      lead: { clientId: "client-1" },
    });

    await expect(
      respondToInterest(prisma, { interestId: "interest-1", clientId: "client-1", decision: "decline" })
    ).rejects.toMatchObject({ status: 409 });
  });

  it("ao aceitar, libera o contato e notifica o advogado", async () => {
    prisma.interestManifestation.findUnique.mockResolvedValue({
      id: "interest-1",
      status: "PENDING",
      lawyerId: "lawyer-1",
      leadId: "lead-1",
      lead: { clientId: "client-1" },
    });
    prisma.interestManifestation.update.mockResolvedValue({ id: "interest-1", status: "ACCEPTED" });

    const result = await respondToInterest(prisma, {
      interestId: "interest-1",
      clientId: "client-1",
      decision: "accept",
    });

    expect(result.status).toBe("ACCEPTED");
    const updateCall = prisma.interestManifestation.update.mock.calls[0][0];
    expect(updateCall.data.status).toBe("ACCEPTED");
    expect(updateCall.data.contactReleasedAt).toBeInstanceOf(Date);
    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "lawyer-1", type: "CONTACT_ACCEPTED" }),
      })
    );
  });

  it("ao recusar, NÃO libera o contato e notifica o advogado", async () => {
    prisma.interestManifestation.findUnique.mockResolvedValue({
      id: "interest-1",
      status: "PENDING",
      lawyerId: "lawyer-1",
      leadId: "lead-1",
      lead: { clientId: "client-1" },
    });
    prisma.interestManifestation.update.mockResolvedValue({ id: "interest-1", status: "DECLINED" });

    await respondToInterest(prisma, { interestId: "interest-1", clientId: "client-1", decision: "decline" });

    const updateCall = prisma.interestManifestation.update.mock.calls[0][0];
    expect(updateCall.data.status).toBe("DECLINED");
    expect(updateCall.data.contactReleasedAt).toBeNull();
    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "lawyer-1", type: "CONTACT_DECLINED" }),
      })
    );
  });
});
