import { TextareaHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  maxLength?: number;
  currentLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, id, className, maxLength, currentLength, ...props }, ref) => {
    const textareaId = id ?? props.name;

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <label htmlFor={textareaId} className="text-label text-foreground-secondary">
            {label}
          </label>
          {typeof maxLength === "number" && (
            <span className="text-caption text-foreground-muted">
              {currentLength ?? 0}/{maxLength}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
          className={clsx(
            "min-h-32 resize-y rounded-md border bg-surface px-3.5 py-3 text-body text-foreground placeholder:text-foreground-muted",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary",
            error ? "border-destructive" : "border-border-strong hover:border-foreground-muted",
            className
          )}
          {...props}
        />
        {error ? (
          <span id={`${textareaId}-error`} role="alert" className="text-small text-destructive">
            {error}
          </span>
        ) : hint ? (
          <span id={`${textareaId}-hint`} className="text-small text-foreground-muted">
            {hint}
          </span>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
