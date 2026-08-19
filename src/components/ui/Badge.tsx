import { HTMLAttributes } from "react";
import clsx from "clsx";

type Tone = "primary" | "accent" | "success" | "warning" | "destructive" | "info" | "neutral";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary-subtle text-primary",
  accent: "bg-accent-subtle text-accent",
  success: "bg-success-subtle text-success",
  warning: "bg-warning-subtle text-warning",
  destructive: "bg-destructive-subtle text-destructive",
  info: "bg-info-subtle text-info",
  neutral: "bg-background-secondary text-foreground-secondary",
};

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-caption font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
