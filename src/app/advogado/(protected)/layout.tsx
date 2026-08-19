import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Briefcase, Wallet } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CoinBalance } from "@/components/dashboard/CoinBalance";
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
      { label: "Carteira", href: "/advogado/carteira", icon: <Wallet className="size-4.5" aria-hidden /> },
    ],
  },
];

export default async function AdvogadoLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/advogado/entrar");
  }
  if (session.user.role !== "LAWYER") {
    redirect("/");
  }

  const lawyer = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, coinBalance: true, oabNumber: true, oabState: true },
  });

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
      walletSlot={<CoinBalance balance={lawyer.coinBalance} />}
    >
      {children}
    </AppShell>
  );
}
