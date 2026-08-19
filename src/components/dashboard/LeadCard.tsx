import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { UnlockButton } from "@/components/dashboard/UnlockButton";
import { PublicLead, UnlockedLead } from "@/lib/masking";
import { LEGAL_AREA_LABELS, URGENCY_LABELS } from "@/lib/constants";

const URGENCY_TONE = {
  ALTA: "accent",
  MEDIA: "primary",
  BAIXA: "neutral",
} as const;

interface Props {
  lead: PublicLead;
  remainingSlots: number;
  unlockedByCurrentLawyer: UnlockedLead | null;
}

export function LeadCard({ lead, remainingSlots, unlockedByCurrentLawyer }: Props) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="primary">{LEGAL_AREA_LABELS[lead.legalArea]}</Badge>
        <Badge tone={URGENCY_TONE[lead.urgency]}>{URGENCY_LABELS[lead.urgency]}</Badge>
        <span className="ml-auto text-xs text-slate-500">
          {lead.city}/{lead.state}
        </span>
      </div>

      <p className="text-sm text-primary-900">{lead.descriptionPreview}</p>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {remainingSlots > 0
            ? `${remainingSlots} vaga(s) de desbloqueio restante(s)`
            : "Todas as vagas foram preenchidas"}
        </span>
      </div>

      <UnlockButton
        leadId={lead.id}
        coinCost={lead.coinCost}
        remainingSlots={remainingSlots}
        initialUnlocked={unlockedByCurrentLawyer}
      />
    </Card>
  );
}
