import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Briefcase, CreditCard } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SubscriptionBadge } from "@/components/dashboard/SubscriptionBadge";
import { AppShell } from "@/components/shell/AppShell";
import { NavGroup } from "@/components/shell/types";

const navGroups: NavGroup[] = [
  {
    title: "Principal",
    items: [
      {
        label: "Oportunidades",
        href: "/advogado/dashboard",
        icon: <Briefcase className="size-4.5" aria-hidden />,
      },
      {
        label: "Assinatura",
        href: "/advogado/assinatura",
        icon: <CreditCard className="size-4.5" aria-hidden />,
      },
    ],
  },
];

export default async function AdvogadoLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/advogado/entrar");
  }
  if (session.user.role !== "LAWYER") {
    redirect("/?contaErrada=cliente");
  }

  const [lawyer, activeSubscription] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, oabNumber: true, oabState: true },
    }),
    prisma.subscription.findFirst({
      where: { lawyerId: session.user.id, status: "ACTIVE" },
    }),
  ]);

  if (!lawyer) {
    redirect("/advogado/entrar");
  }

  const subtitle = lawyer.oabNumber ? `OAB/${lawyer.oabState} ${lawyer.oabNumber}` : undefined;

  return (
    <AppShell
      brandHref="/advogado/dashboard"
      navGroups={navGroups}
      userName={lawyer.name}
      userSubtitle={subtitle}
      walletSlot={<SubscriptionBadge plan={activeSubscription?.plan ?? null} />}
    >
      {children}
    </AppShell>
  );
}
