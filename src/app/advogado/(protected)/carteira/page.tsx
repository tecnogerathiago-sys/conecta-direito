import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WalletCard } from "@/components/dashboard/WalletCard";
import { CoinPackageCard } from "@/components/dashboard/CoinPackageCard";
import { TransactionTable, TransactionRow } from "@/components/dashboard/TransactionTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { totalCoinsForPackage } from "@/lib/pricing";

const TX_LABELS: Record<string, string> = {
  PURCHASE: "Compra de pacote",
  UNLOCK_SPEND: "Desbloqueio de contato",
  REFUND: "Estorno",
  BONUS: "Bônus",
};

const PAGE_SIZE = 10;

interface Props {
  searchParams: { txPage?: string };
}

export default async function CarteiraPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/advogado/entrar");
  const lawyerId = session.user.id;

  const [lawyer, packages, allTransactions] = await Promise.all([
    prisma.user.findUnique({ where: { id: lawyerId }, select: { coinBalance: true } }),
    prisma.coinPackage.findMany({ where: { isActive: true }, orderBy: { displayOrder: "asc" } }),
    prisma.transaction.findMany({
      where: { userId: lawyerId },
      orderBy: { createdAt: "desc" },
      include: { coinPackage: true },
    }),
  ]);

  const coinBalance = lawyer?.coinBalance ?? 0;

  // Saldo corrente é conhecido; a partir dele, o saldo "depois" de cada
  // transação mais antiga é o saldo atual menos a soma de tudo que veio
  // depois — por isso computamos de trás pra frente sobre a lista completa.
  let runningBalance = coinBalance;
  const rows: TransactionRow[] = allTransactions.map((tx) => {
    const balanceAfter = runningBalance;
    runningBalance -= tx.coinAmount;
    const description =
      tx.type === "PURCHASE" && tx.coinPackage
        ? `Compra do pacote ${tx.coinPackage.name}`
        : TX_LABELS[tx.type];
    return { id: tx.id, createdAt: tx.createdAt, description, coinAmount: tx.coinAmount, balanceAfter };
  });

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(searchParams.txPage) || 1), totalPages);
  const pagedRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const baseRate =
    packages.length > 0
      ? Number(packages[0].priceBRL) / totalCoinsForPackage(packages[0].coinAmount, packages[0].bonusCoins)
      : 0;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <PageHeader title="Carteira" description="Gerencie suas moedas e acompanhe sua atividade." />
        <WalletCard balance={coinBalance} />
      </div>

      <section>
        <h2 className="mb-4 text-h2 text-foreground">Comprar moedas</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {packages.map((pkg, i) => {
            const total = totalCoinsForPackage(pkg.coinAmount, pkg.bonusCoins);
            const rate = Number(pkg.priceBRL) / total;
            const savingsPercent = baseRate > 0 ? Math.round((1 - rate / baseRate) * 100) : 0;

            return (
              <CoinPackageCard
                key={pkg.id}
                id={pkg.id}
                name={pkg.name}
                coinAmount={pkg.coinAmount}
                bonusCoins={pkg.bonusCoins}
                totalCoins={total}
                priceBRL={Number(pkg.priceBRL)}
                recommended={i === 1}
                savingsPercent={savingsPercent > 0 ? savingsPercent : undefined}
              />
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-h2 text-foreground">Atividade recente</h2>
        <TransactionTable rows={pagedRows} page={page} totalPages={totalPages} basePath="/advogado/carteira" />
      </section>
    </div>
  );
}
