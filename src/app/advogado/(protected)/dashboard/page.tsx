import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { SearchX, Inbox, Wallet } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toPublicLead, toUnlockedLead } from "@/lib/masking";
import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { LegalArea, Urgency } from "@prisma/client";

interface Props {
  searchParams: { local?: string; busca?: string; area?: string; urgencia?: string; moedas?: string };
}

export default async function LeadsDashboardPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/advogado/entrar");
  const lawyerId = session.user.id;

  const location = searchParams.local?.trim();
  const keyword = searchParams.busca?.trim();
  const area = Object.values(LegalArea).includes(searchParams.area as LegalArea)
    ? (searchParams.area as LegalArea)
    : undefined;
  const urgency = Object.values(Urgency).includes(searchParams.urgencia as Urgency)
    ? (searchParams.urgencia as Urgency)
    : undefined;
  const maxCoins = searchParams.moedas ? Number(searchParams.moedas) : undefined;

  const [lawyer, leads] = await Promise.all([
    prisma.user.findUnique({ where: { id: lawyerId }, select: { coinBalance: true } }),
    prisma.lead.findMany({
      where: {
        AND: [
          { OR: [{ status: "OPEN" }, { unlocks: { some: { lawyerId } } }] },
          location
            ? {
                OR: [
                  { city: { contains: location, mode: "insensitive" } },
                  { state: { contains: location, mode: "insensitive" } },
                ],
              }
            : {},
          keyword ? { description: { contains: keyword, mode: "insensitive" } } : {},
          area ? { legalArea: area } : {},
          urgency ? { urgency } : {},
          maxCoins ? { coinCost: { lte: maxCoins } } : {},
        ],
      },
      orderBy: { createdAt: "desc" },
      include: { unlocks: true },
      take: 50,
    }),
  ]);

  const coinBalance = lawyer?.coinBalance ?? 0;
  const hasActiveFilters = Boolean(location || keyword || area || urgency || maxCoins);

  return (
    <div>
      <PageHeader
        title="Oportunidades"
        description="Encontre casos que combinam com sua área de atuação."
        actions={
          <Link href="/advogado/carteira">
            <Button variant="accent" size="sm">
              <Wallet className="size-4" aria-hidden />
              Comprar moedas
            </Button>
          </Link>
        }
      />

      <FilterBar
        defaultLocation={location}
        defaultKeyword={keyword}
        defaultArea={area}
        defaultUrgency={urgency}
        defaultMaxCoins={searchParams.moedas}
      />

      <p className="mb-4 text-small text-foreground-secondary">
        {leads.length} oportunidade{leads.length === 1 ? "" : "s"} encontrada{leads.length === 1 ? "" : "s"}
      </p>

      {leads.length === 0 ? (
        <EmptyState
          icon={hasActiveFilters ? SearchX : Inbox}
          title={
            hasActiveFilters
              ? "Nenhuma oportunidade encontrada"
              : "Nenhuma oportunidade disponível no momento"
          }
          description={
            hasActiveFilters
              ? "Tente ajustar ou limpar os filtros para ver mais resultados."
              : "Novos casos aparecem aqui assim que forem publicados."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {leads.map((lead) => {
            const myUnlock = lead.unlocks.find((u) => u.lawyerId === lawyerId);
            const remainingSlots = lead.maxUnlocks - lead.unlocks.length;

            return (
              <OpportunityCard
                key={lead.id}
                lead={toPublicLead(lead)}
                remainingSlots={remainingSlots}
                coinBalance={coinBalance}
                unlockedByCurrentLawyer={myUnlock ? toUnlockedLead(lead) : null}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
