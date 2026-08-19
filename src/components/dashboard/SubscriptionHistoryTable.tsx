import { Receipt } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPlanDefinition } from "@/lib/subscriptions";
import type { Subscription } from "@prisma/client";

const STATUS_LABELS: Record<Subscription["status"], string> = {
  PENDING: "Pendente",
  ACTIVE: "Ativa",
  PAST_DUE: "Atrasada",
  CANCELED: "Cancelada",
};

const STATUS_TONE: Record<Subscription["status"], "success" | "warning" | "destructive" | "neutral"> = {
  PENDING: "warning",
  ACTIVE: "success",
  PAST_DUE: "destructive",
  CANCELED: "neutral",
};

interface Props {
  subscriptions: Subscription[];
}

export function SubscriptionHistoryTable({ subscriptions }: Props) {
  if (subscriptions.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="Nenhuma assinatura ainda"
        description="O histórico de planos e pagamentos vai aparecer aqui."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-small">
          <thead>
            <tr className="border-b border-border bg-background-secondary text-caption font-medium uppercase tracking-wide text-foreground-muted">
              <th className="px-4 py-2.5">Início</th>
              <th className="px-4 py-2.5">Plano</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="transition-colors duration-150 hover:bg-surface-hover">
                <td className="whitespace-nowrap px-4 py-3 text-foreground-secondary">
                  {sub.startedAt.toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-foreground">{getPlanDefinition(sub.plan).name}</td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONE[sub.status]}>{STATUS_LABELS[sub.status]}</Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-foreground-secondary">
                  {Number(sub.priceBRL).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
