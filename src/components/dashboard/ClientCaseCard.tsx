import { MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LEGAL_AREA_LABELS, URGENCY_LABELS } from "@/lib/constants";
import { InterestedLawyersList, InterestedLawyerRow } from "@/components/dashboard/InterestedLawyersList";
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
  caseCode: string;
  legalArea: LegalArea;
  urgency: Urgency;
  status: LeadStatus;
  city: string;
  state: string;
  createdAt: Date;
  maxInterests: number;
  interests: InterestedLawyerRow[];
}

export function ClientCaseCard({
  caseCode,
  legalArea,
  urgency,
  status,
  city,
  state,
  createdAt,
  maxInterests,
  interests,
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

      <div className="flex items-center justify-between gap-2">
        <span className="text-small font-medium text-foreground">{caseCode}</span>
        <div className="flex items-center gap-1.5 text-small text-foreground-secondary">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          {city}, {state}
        </div>
      </div>

      <Badge tone={STATUS_TONE[status]} className="w-fit">
        {STATUS_LABELS[status]}
      </Badge>

      <div className="border-t border-border pt-3.5">
        <div className="mb-2.5 flex items-center justify-between text-small">
          <span className="flex items-center gap-1.5 text-foreground-secondary">
            <Users className="size-3.5" aria-hidden />
            Advogados interessados no seu caso
          </span>
          <span className="font-medium text-foreground">
            {interests.length}/{maxInterests}
          </span>
        </div>
        <InterestedLawyersList rows={interests} />
      </div>
    </Card>
  );
}
