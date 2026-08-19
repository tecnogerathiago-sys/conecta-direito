import { PrismaClient, LegalArea, Urgency } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getPlanDefinition } from "../src/lib/subscriptions";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("senha123", 10);
  const lawyer = await prisma.user.upsert({
    where: { email: "advogado.demo@conectadireito.com.br" },
    update: {},
    create: {
      role: "LAWYER",
      name: "Dra. Ana Ribeiro",
      email: "advogado.demo@conectadireito.com.br",
      passwordHash,
      oabNumber: "123456",
      oabState: "SP",
      phone: "(11) 99999-0000",
      areasOfPractice: ["TRABALHISTA", "CONSUMIDOR", "FAMILIA"],
      activeRegions: ["São Paulo/SP"],
    },
  });

  const hasActiveSubscription = await prisma.subscription.findFirst({
    where: { lawyerId: lawyer.id, status: "ACTIVE" },
  });
  if (!hasActiveSubscription) {
    const basico = getPlanDefinition("BASICO");
    await prisma.subscription.create({
      data: {
        lawyerId: lawyer.id,
        plan: basico.plan,
        priceBRL: basico.priceBRL,
        status: "ACTIVE",
        renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentProvider: "seed",
      },
    });
  }

  const demoLeads: {
    fullName: string;
    cpf: string;
    birthDate: Date;
    phone: string;
    email: string;
    legalArea: LegalArea;
    description: string;
    urgency: Urgency;
    city: string;
    state: string;
  }[] = [
    {
      fullName: "João da Silva",
      cpf: "111.222.333-44",
      birthDate: new Date("1990-05-14"),
      phone: "(11) 98888-1234",
      email: "joao.silva@example.com",
      legalArea: "TRABALHISTA",
      description:
        "Fui demitido sem justa causa e não recebi verbas rescisórias nem o FGTS. Preciso de orientação sobre como cobrar esses valores da empresa.",
      urgency: "ALTA",
      city: "São Paulo",
      state: "SP",
    },
    {
      fullName: "Maria Oliveira",
      cpf: "222.333.444-55",
      birthDate: new Date("1985-11-02"),
      phone: "(21) 97777-5678",
      email: "maria.oliveira@example.com",
      legalArea: "CONSUMIDOR",
      description:
        "Comprei um produto online que nunca chegou e a loja não responde mais. Quero saber como pedir o reembolso e se cabe indenização.",
      urgency: "MEDIA",
      city: "Rio de Janeiro",
      state: "RJ",
    },
    {
      fullName: "Carlos Mendes",
      cpf: "333.444.555-66",
      birthDate: new Date("1975-02-20"),
      phone: "(31) 96666-4321",
      email: "carlos.mendes@example.com",
      legalArea: "FAMILIA",
      description:
        "Estou em processo de divórcio e preciso definir a guarda compartilhada dos filhos e a partilha de bens de forma amigável.",
      urgency: "BAIXA",
      city: "Belo Horizonte",
      state: "MG",
    },
  ];

  for (const lead of demoLeads) {
    await prisma.lead.create({ data: lead });
  }

  console.log("Seed concluído. Login de demonstração:");
  console.log(`  e-mail: ${lawyer.email}`);
  console.log("  senha:  senha123");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
