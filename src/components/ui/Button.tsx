import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "success" | "accent" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-light",
  success: "bg-success text-white hover:bg-success-600",
  accent: "bg-accent text-white hover:bg-accent-600",
  outline: "border border-primary-100 text-primary bg-white hover:bg-primary-50",
  ghost: "text-primary hover:bg-primary-50",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", fullWidth, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variantClasses[variant],
          fullWidth && "w-full",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
