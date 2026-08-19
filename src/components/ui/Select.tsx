import { SelectHTMLAttributes, forwardRef } from "react";
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
        <label htmlFor={selectId} className="text-sm font-medium text-primary-700">
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            "rounded-lg border bg-white px-3.5 py-2.5 text-sm text-primary-900",
            "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent",
            error ? "border-red-400" : "border-primary-100",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-xs font-medium text-red-500">{error}</span>}
      </div>
    );
  }
);

Select.displayName = "Select";
