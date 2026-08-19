import { Check } from "lucide-react";
import clsx from "clsx";

interface StepperProps {
  steps: string[];
  currentStep: number; // 1-indexed
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <ol className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((label, i) => {
        const stepNumber = i + 1;
        const isComplete = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <li key={label} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-caption font-semibold transition-colors duration-150",
                  isComplete && "bg-success text-success-foreground",
                  isCurrent && "bg-primary text-primary-foreground",
                  !isComplete && !isCurrent && "bg-background-secondary text-foreground-muted"
                )}
              >
                {isComplete ? <Check className="size-3.5" aria-hidden /> : stepNumber}
              </span>
              <span
                className={clsx(
                  "hidden text-small font-medium sm:inline",
                  isCurrent ? "text-foreground" : "text-foreground-muted"
                )}
              >
                {label}
              </span>
            </div>
            {stepNumber < steps.length && (
              <span className="h-px w-6 shrink-0 bg-border sm:w-10" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
