import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className, children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-label text-foreground-secondary">
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${selectId}-error` : undefined}
            className={clsx(
              "h-11 w-full appearance-none rounded-md border bg-surface px-3.5 pr-9 text-body text-foreground",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary",
              "disabled:cursor-not-allowed disabled:bg-background-secondary disabled:text-foreground-muted",
              error ? "border-destructive" : "border-border-strong hover:border-foreground-muted",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted"
            aria-hidden
          />
        </div>
        {error && (
          <span id={`${selectId}-error`} role="alert" className="text-small text-destructive">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
