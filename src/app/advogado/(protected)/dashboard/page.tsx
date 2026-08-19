import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toPublicLead, toUnlockedLead } from "@/lib/masking";
import { LeadCard } from "@/components/dashboard/LeadCard";

export default async function LeadsDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/advogado/entrar");
  const lawyerId = session.user.id;

  const leads = await prisma.lead.findMany({
    where: {
      OR: [{ status: "OPEN" }, { unlocks: { some: { lawyerId } } }],
    },
    orderBy: { createdAt: "desc" },
    include: { unlocks: true },
    take: 50,
  });

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-primary-900">Mural de oportunidades</h1>
      <p className="mb-6 text-sm text-slate-500">
        Desbloqueie o contato de clientes que precisam de um advogado como você.
      </p>

      {leads.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhuma oportunidade disponível no momento.</p>
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
