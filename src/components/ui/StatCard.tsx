import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  tone?: "default" | "accent";
  hint?: string;
}

export function StatCard({ label, value, icon: Icon, tone = "default", hint }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-label text-foreground-secondary">{label}</span>
        {Icon && (
          <span
            className={clsx(
              "flex size-8 items-center justify-center rounded-md",
              tone === "accent" ? "bg-accent-subtle text-accent" : "bg-primary-subtle text-primary"
            )}
          >
            <Icon className="size-4" aria-hidden />
          </span>
        )}
      </div>
      <p className="mt-2 text-h1 text-foreground">{value}</p>
      {hint && <p className="mt-1 text-small text-foreground-secondary">{hint}</p>}
    </div>
  );
}
