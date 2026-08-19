import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CoinBalance } from "@/components/dashboard/CoinBalance";

export default async function AdvogadoLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/advogado/entrar");
  }

  const lawyer = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, coinBalance: true },
  });

  if (!lawyer) {
    redirect("/advogado/entrar");
  }

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="border-b border-primary-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <nav className="flex items-center gap-6">
            <Link href="/advogado/dashboard" className="font-bold text-primary-900">
              Conecta Direito
            </Link>
            <Link href="/advogado/dashboard" className="text-sm font-medium text-slate-600 hover:text-primary-900">
              Oportunidades
            </Link>
            <Link href="/advogado/carteira" className="text-sm font-medium text-slate-600 hover:text-primary-900">
              Carteira
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <CoinBalance balance={lawyer.coinBalance} />
            <span className="text-sm font-medium text-primary-900">{lawyer.name}</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
