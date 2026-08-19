import { HTMLAttributes } from "react";
import clsx from "clsx";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className={clsx("animate-pulse rounded-md bg-background-secondary", className)}
      {...props}
    />
  );
}
