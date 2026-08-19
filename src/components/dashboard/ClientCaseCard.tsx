import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LEGAL_AREA_LABELS, URGENCY_LABELS } from "@/lib/constants";
import type { LegalArea, Urgency, LeadStatus } from "@prisma/client";

const STATUS_LABELS: Record<LeadStatus, string> = {
  OPEN: "Aguardando advogados",
  CLOSED: "Todas as vagas preenchidas",
  EXPIRED: "Expirado",
};

const STATUS_TONE = {
  OPEN: "primary",
  CLOSED: "success",
  EXPIRED: "neutral",
} as const;

interface Props {
  legalArea: LegalArea;
  urgency: Urgency;
  status: LeadStatus;
  city: string;
  state: string;
  createdAt: Date;
  unlocksCount: number;
  maxUnlocks: number;
}

export function ClientCaseCard({
  legalArea,
  urgency,
  status,
  city,
  state,
  createdAt,
  unlocksCount,
  maxUnlocks,
}: Props) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="primary">{LEGAL_AREA_LABELS[legalArea]}</Badge>
        <Badge tone="neutral">{URGENCY_LABELS[urgency]}</Badge>
        <span className="ml-auto text-xs text-slate-500">
          {city}/{state}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <Badge tone={STATUS_TONE[status]}>{STATUS_LABELS[status]}</Badge>
        <span className="text-xs text-slate-500">
          {createdAt.toLocaleDateString("pt-BR")}
        </span>
      </div>

      <p className="text-sm text-slate-600">
        {unlocksCount} de {maxUnlocks} advogados já demonstraram interesse no seu caso.
      </p>
    </Card>
  );
}
