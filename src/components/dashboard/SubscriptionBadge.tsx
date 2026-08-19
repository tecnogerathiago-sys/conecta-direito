import Link from "next/link";
import { CreditCard } from "lucide-react";
import { getPlanDefinition } from "@/lib/subscriptions";
import type { SubscriptionPlan } from "@prisma/client";

interface Props {
  plan: SubscriptionPlan | null;
}

export function SubscriptionBadge({ plan }: Props) {
  const label = plan ? `Plano ${getPlanDefinition(plan).name}` : "Sem assinatura ativa";

  return (
    <Link
      href="/advogado/assinatura"
      className="flex items-center gap-2 rounded-md bg-accent-subtle px-3 py-1.5 text-small font-semibold text-accent transition-colors duration-150 hover:bg-accent-subtle/70"
    >
      <CreditCard className="size-4" aria-hidden />
      {label}
    </Link>
  );
}
