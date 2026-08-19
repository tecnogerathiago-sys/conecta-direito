import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const inputId = id ?? props.name;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-label text-foreground-secondary">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={clsx(
            "h-11 rounded-md border bg-surface px-3.5 text-body text-foreground placeholder:text-foreground-muted",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:bg-background-secondary disabled:text-foreground-muted",
            error ? "border-destructive" : "border-border-strong hover:border-foreground-muted",
            className
          )}
          {...props}
        />
        {error ? (
          <span id={`${inputId}-error`} role="alert" className="text-small text-destructive">
            {error}
          </span>
        ) : hint ? (
          <span id={`${inputId}-hint`} className="text-small text-foreground-muted">
            {hint}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
