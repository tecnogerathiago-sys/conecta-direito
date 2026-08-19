import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border-strong bg-surface px-6 py-16 text-center">
      {Icon && (
        <div className="flex size-11 items-center justify-center rounded-md bg-background-secondary text-foreground-muted">
          <Icon className="size-5" aria-hidden />
        </div>
      )}
      <div className="space-y-1">
        <p className="text-h3 text-foreground">{title}</p>
        {description && <p className="text-body text-foreground-secondary">{description}</p>}
      </div>
      {action}
    </div>
  );
}
