import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toPublicLead, toUnlockedLead } from "@/lib/masking";
import { LeadCard } from "@/components/dashboard/LeadCard";
import { LeadFilters } from "@/components/dashboard/LeadFilters";

interface Props {
  searchParams: { local?: string; busca?: string };
}

export default async function LeadsDashboardPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/advogado/entrar");
  const lawyerId = session.user.id;

  const location = searchParams.local?.trim();
  const keyword = searchParams.busca?.trim();

  const leads = await prisma.lead.findMany({
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
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { unlocks: true },
    take: 50,
  });

  const hasActiveFilters = Boolean(location || keyword);

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-primary-900">Mural de oportunidades</h1>
      <p className="mb-6 text-sm text-slate-500">
        Desbloqueie o contato de clientes que precisam de um advogado como você.
      </p>

      <LeadFilters defaultLocation={location} defaultKeyword={keyword} />

      {leads.length === 0 ? (
        <p className="text-sm text-slate-500">
          {hasActiveFilters
            ? "Nenhuma oportunidade encontrada com esses filtros."
            : "Nenhuma oportunidade disponível no momento."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leads.map((lead) => {
            const myUnlock = lead.unlocks.find((u) => u.lawyerId === lawyerId);
            const remainingSlots = lead.maxUnlocks - lead.unlocks.length;

            return (
              <LeadCard
                key={lead.id}
                lead={toPublicLead(lead)}
                remainingSlots={remainingSlots}
                unlockedByCurrentLawyer={myUnlock ? toUnlockedLead(lead) : null}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
