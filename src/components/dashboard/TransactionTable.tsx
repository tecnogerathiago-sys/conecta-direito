import Link from "next/link";
import { ChevronLeft, ChevronRight, Receipt } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export interface TransactionRow {
  id: string;
  createdAt: Date;
  description: string;
  coinAmount: number;
  balanceAfter: number;
}

interface Props {
  rows: TransactionRow[];
  page: number;
  totalPages: number;
  basePath: string;
}

export function TransactionTable({ rows, page, totalPages, basePath }: Props) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="Nenhuma movimentação ainda"
        description="Suas compras de moedas e desbloqueios de contato vão aparecer aqui."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-small">
          <thead>
            <tr className="border-b border-border bg-background-secondary text-caption font-medium uppercase tracking-wide text-foreground-muted">
              <th className="px-4 py-2.5">Data</th>
              <th className="px-4 py-2.5">Descrição</th>
              <th className="px-4 py-2.5 text-right">Moedas</th>
              <th className="px-4 py-2.5 text-right">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors duration-150 hover:bg-surface-hover">
                <td className="whitespace-nowrap px-4 py-3 text-foreground-secondary">
                  {row.createdAt.toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-foreground">{row.description}</td>
                <td
                  className={`whitespace-nowrap px-4 py-3 text-right font-medium ${
                    row.coinAmount >= 0 ? "text-success" : "text-foreground"
                  }`}
                >
                  {row.coinAmount >= 0 ? "+" : ""}
                  {row.coinAmount}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-foreground-secondary">
                  {row.balanceAfter}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <span className="text-caption text-foreground-muted">
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-1.5">
            <Link
              href={`${basePath}?txPage=${page - 1}`}
              aria-disabled={page <= 1}
              className={`flex size-8 items-center justify-center rounded-md border border-border-strong text-foreground-secondary transition-colors duration-150 ${
                page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-background-secondary"
              }`}
            >
              <ChevronLeft className="size-4" aria-hidden />
            </Link>
            <Link
              href={`${basePath}?txPage=${page + 1}`}
              aria-disabled={page >= totalPages}
              className={`flex size-8 items-center justify-center rounded-md border border-border-strong text-foreground-secondary transition-colors duration-150 ${
                page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-background-secondary"
              }`}
            >
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
