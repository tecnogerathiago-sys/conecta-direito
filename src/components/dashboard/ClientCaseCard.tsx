import { MapPin, Users } from "lucide-react";
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
  OPEN: "info",
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
    <Card className="flex flex-col gap-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="primary">{LEGAL_AREA_LABELS[legalArea]}</Badge>
          <Badge tone="neutral">{URGENCY_LABELS[urgency]}</Badge>
        </div>
        <span className="shrink-0 text-caption text-foreground-muted">
          {createdAt.toLocaleDateString("pt-BR")}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-small text-foreground-secondary">
        <MapPin className="size-3.5 shrink-0" aria-hidden />
        {city}, {state}
      </div>

      <Badge tone={STATUS_TONE[status]} className="w-fit">
        {STATUS_LABELS[status]}
      </Badge>

      <div className="border-t border-border pt-3.5">
        <div className="mb-1.5 flex items-center justify-between text-small">
          <span className="flex items-center gap-1.5 text-foreground-secondary">
            <Users className="size-3.5" aria-hidden />
            Interesse de advogados
          </span>
          <span className="font-medium text-foreground">
            {unlocksCount}/{maxUnlocks}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-background-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-150"
            style={{ width: `${maxUnlocks > 0 ? (unlocksCount / maxUnlocks) * 100 : 0}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
