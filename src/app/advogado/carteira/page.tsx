import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { CoinPackageCard } from "@/components/dashboard/CoinPackageCard";
import { totalCoinsForPackage } from "@/lib/pricing";

export default async function CarteiraPage() {
  const session = await getServerSession(authOptions);
  const lawyerId = session!.user.id;

  const [packages, recentTransactions] = await Promise.all([
    prisma.coinPackage.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.transaction.findMany({
      where: { userId: lawyerId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="mb-1 text-xl font-bold text-primary-900">Loja de moedas</h1>
        <p className="mb-6 text-sm text-slate-500">
          Compre moedas para desbloquear contatos de novos clientes.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {packages.map((pkg) => (
            <CoinPackageCard
              key={pkg.id}
              id={pkg.id}
              name={pkg.name}
              coinAmount={pkg.coinAmount}
              bonusCoins={pkg.bonusCoins}
              totalCoins={totalCoinsForPackage(pkg.coinAmount, pkg.bonusCoins)}
              priceBRL={Number(pkg.priceBRL)}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-primary-900">Histórico recente</h2>
        <Card className="divide-y divide-primary-50 p-0">
          {recentTransactions.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">Nenhuma transação ainda.</p>
          ) : (
            recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-6 py-3.5 text-sm">
                <div>
                  <p className="font-medium text-primary-900">{TX_LABELS[tx.type]}</p>
                  <p className="text-xs text-slate-500">
                    {tx.createdAt.toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span
                  className={`font-semibold ${tx.coinAmount >= 0 ? "text-success" : "text-primary-700"}`}
                >
                  {tx.coinAmount >= 0 ? "+" : ""}
                  {tx.coinAmount} moedas
                </span>
              </div>
            ))
          )}
        </Card>
      </section>
    </div>
  );
}

const TX_LABELS: Record<string, string> = {
  PURCHASE: "Compra de pacote",
  UNLOCK_SPEND: "Desbloqueio de contato",
  REFUND: "Estorno",
  BONUS: "Bônus",
};
