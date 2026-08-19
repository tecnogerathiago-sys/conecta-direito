import { HTMLAttributes } from "react";
import clsx from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-lg border border-primary-100 bg-surface p-6 shadow-sm",
        className
      )}
      {...props}
    />
  );
}
