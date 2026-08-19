import { MapPin, Clock, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { UnlockButton } from "@/components/dashboard/UnlockButton";
import { PublicLead, UnlockedLead } from "@/lib/masking";
import { LEGAL_AREA_LABELS, URGENCY_LABELS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format";

const URGENCY_TONE = {
  ALTA: "warning",
  MEDIA: "info",
  BAIXA: "neutral",
} as const;

interface Props {
  lead: PublicLead;
  remainingSlots: number;
  coinBalance: number;
  unlockedByCurrentLawyer: UnlockedLead | null;
}

export function OpportunityCard({ lead, remainingSlots, coinBalance, unlockedByCurrentLawyer }: Props) {
  return (
    <Card className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone="primary">{LEGAL_AREA_LABELS[lead.legalArea]}</Badge>
        {lead.urgency === "ALTA" && <Badge tone={URGENCY_TONE[lead.urgency]}>Urgente</Badge>}
      </div>

      <h3 className="text-h3 leading-snug text-foreground">{lead.title}</h3>

      <div className="flex items-center gap-1.5 text-small text-foreground-secondary">
        <MapPin className="size-3.5 shrink-0" aria-hidden />
        {lead.city}, {lead.state}
      </div>

      <p className="text-small leading-relaxed text-foreground-secondary">{lead.descriptionPreview}</p>

      <div className="flex items-center gap-3 text-caption text-foreground-muted">
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" aria-hidden />
          {formatRelativeTime(lead.createdAt)}
        </span>
        <span className="flex items-center gap-1">
          <Users className="size-3.5" aria-hidden />
          {remainingSlots > 0 ? `${remainingSlots} vaga(s) restante(s)` : "Vagas preenchidas"}
        </span>
      </div>

      <div className="mt-1 border-t border-border pt-3.5">
        <UnlockButton
          leadId={lead.id}
          coinCost={lead.coinCost}
          coinBalance={coinBalance}
          remainingSlots={remainingSlots}
          initialUnlocked={unlockedByCurrentLawyer}
        />
      </div>
    </Card>
  );
}
