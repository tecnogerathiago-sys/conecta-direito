import { Avatar } from "@/components/ui/Avatar";
import { RespondToInterestButtons } from "@/components/dashboard/RespondToInterestButtons";
import type { InterestStatus } from "@prisma/client";

export interface InterestedLawyerRow {
  interestId: string;
  status: InterestStatus;
  lawyerName: string;
  oab: string | null;
  region: string | null;
}

export function InterestedLawyersList({ rows }: { rows: InterestedLawyerRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-small text-foreground-muted">
        Nenhum advogado manifestou interesse neste caso ainda.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row) => (
        <li
          key={row.interestId}
          className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background-secondary p-3"
        >
          <div className="flex items-center gap-3">
            <Avatar name={row.lawyerName} size="sm" />
            <div>
              <p className="text-small font-medium text-foreground">{row.lawyerName}</p>
              <p className="text-caption text-foreground-muted">
                {[row.oab, row.region].filter(Boolean).join(" · ") || "Advogado(a)"}
              </p>
            </div>
          </div>
          <RespondToInterestButtons interestId={row.interestId} initialStatus={row.status} />
        </li>
      ))}
    </ul>
  );
}
