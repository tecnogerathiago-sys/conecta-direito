import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { SearchX, Inbox, CreditCard } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toPublicLead, toReleasedContact } from "@/lib/masking";
import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { ComplianceNotice } from "@/components/ui/ComplianceNotice";
import { LegalArea, Urgency } from "@prisma/client";

interface Props {
  searchParams: { local?: string; busca?: string; area?: string; urgencia?: string };
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

  const [activeSubscription, leads] = await Promise.all([
    prisma.subscription.findFirst({ where: { lawyerId, status: "ACTIVE" } }),
    prisma.lead.findMany({
      where: {
        AND: [
          { OR: [{ status: "OPEN" }, { interests: { some: { lawyerId } } }] },
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
        ],
      },
      orderBy: { createdAt: "desc" },
      include: { interests: true },
      take: 50,
    }),
  ]);

  const hasActiveSubscription = Boolean(activeSubscription);
  const hasActiveFilters = Boolean(location || keyword || area || urgency);

  return (
    <div>
      <PageHeader
        title="Oportunidades"
        description="Encontre causas que combinam com sua área de atuação."
        actions={
          !hasActiveSubscription && (
            <Link href="/advogado/assinatura">
              <Button variant="accent" size="sm">
                <CreditCard className="size-4" aria-hidden />
                Assinar plataforma
              </Button>
            </Link>
          )
        }
      />

      <FilterBar defaultLocation={location} defaultKeyword={keyword} defaultArea={area} defaultUrgency={urgency} />

      <div className="mb-4">
        <ComplianceNotice text="As causas são exibidas de forma anônima. O contato do cliente só é revelado depois que ele mesmo aceitar seu interesse." />
      </div>

      <p className="mb-4 text-small text-foreground-secondary">
        {leads.length} causa{leads.length === 1 ? "" : "s"} encontrada{leads.length === 1 ? "" : "s"}
      </p>

      {leads.length === 0 ? (
        <EmptyState
          icon={hasActiveFilters ? SearchX : Inbox}
          title={hasActiveFilters ? "Nenhuma causa encontrada" : "Nenhuma causa disponível no momento"}
          description={
            hasActiveFilters
              ? "Tente ajustar ou limpar os filtros para ver mais resultados."
              : "Novas causas aparecem aqui assim que forem publicadas."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {leads.map((lead) => {
            const myInterest = lead.interests.find((i) => i.lawyerId === lawyerId);
            const remainingSlots = lead.maxInterests - lead.interests.length;

            return (
              <OpportunityCard
                key={lead.id}
                lead={toPublicLead(lead)}
                remainingSlots={remainingSlots}
                hasActiveSubscription={hasActiveSubscription}
                myInterestStatus={myInterest?.status ?? null}
                releasedContact={
                  myInterest?.status === "ACCEPTED" ? toReleasedContact(lead) : null
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
