import { CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { getPlanDefinition } from "@/lib/subscriptions";
import type { Subscription } from "@prisma/client";

const STATUS_LABELS: Record<Subscription["status"], string> = {
  PENDING: "Pagamento pendente",
  ACTIVE: "Ativa",
  PAST_DUE: "Pagamento atrasado",
  CANCELED: "Cancelada",
};

const STATUS_TONE: Record<Subscription["status"], "success" | "warning" | "destructive" | "neutral"> = {
  PENDING: "warning",
  ACTIVE: "success",
  PAST_DUE: "destructive",
  CANCELED: "neutral",
};

interface Props {
  subscription: Subscription | null;
}

export function SubscriptionStatusCard({ subscription }: Props) {
  if (!subscription) {
    return (
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-primary p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-label text-primary-foreground/70">Sua assinatura</p>
          <p className="mt-1 text-h2 text-primary-foreground">Nenhum plano ativo</p>
          <p className="mt-1 text-small text-primary-foreground/70">
            Assine um plano abaixo para acessar o mural de causas e manifestar interesse.
          </p>
        </div>
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground">
          <CreditCard className="size-6" aria-hidden />
        </div>
      </div>
    );
  }

  const planDef = getPlanDefinition(subscription.plan);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-primary p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-label text-primary-foreground/70">Sua assinatura</p>
        <p className="mt-1 text-display leading-none text-primary-foreground">
          Plano {planDef.name}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Badge tone={STATUS_TONE[subscription.status]}>{STATUS_LABELS[subscription.status]}</Badge>
          {subscription.status === "ACTIVE" && subscription.renewsAt && (
            <span className="text-small text-primary-foreground/70">
              Renova em {subscription.renewsAt.toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>
      </div>
      <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground">
        <CreditCard className="size-6" aria-hidden />
      </div>
    </div>
  );
}
