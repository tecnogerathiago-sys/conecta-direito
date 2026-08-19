import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SubscriptionStatusCard } from "@/components/dashboard/SubscriptionStatusCard";
import { PlanCard } from "@/components/dashboard/PlanCard";
import { SubscriptionHistoryTable } from "@/components/dashboard/SubscriptionHistoryTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptions";

export default async function AssinaturaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/advogado/entrar");
  const lawyerId = session.user.id;

  const subscriptions = await prisma.subscription.findMany({
    where: { lawyerId },
    orderBy: { createdAt: "desc" },
  });

  const currentSubscription = subscriptions.find((s) => s.status === "ACTIVE") ?? null;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <PageHeader
          title="Assinatura"
          description="Gerencie seu plano de acesso à plataforma."
        />
        <SubscriptionStatusCard subscription={currentSubscription} />
      </div>

      <section>
        <h2 className="mb-4 text-h2 text-foreground">Planos</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {SUBSCRIPTION_PLANS.map((planDef, i) => (
            <PlanCard
              key={planDef.plan}
              plan={planDef.plan}
              name={planDef.name}
              priceBRL={planDef.priceBRL}
              features={planDef.features}
              recommended={i === SUBSCRIPTION_PLANS.length - 1}
              isCurrentPlan={currentSubscription?.plan === planDef.plan}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-h2 text-foreground">Histórico</h2>
        <SubscriptionHistoryTable subscriptions={subscriptions} />
      </section>
    </div>
  );
}
