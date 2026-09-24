import React from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost" | "link";
export type ButtonDensity = "comfortable" | "compact";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  density?: ButtonDensity;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      density = "comfortable",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    // Density dimensions (§4)
    const densityClasses =
      density === "comfortable"
        ? "h-10 px-4 py-2.5 text-sm gap-2"
        : "h-8 px-3 py-1.5 text-xs gap-1.5";

    // Variants & States (§6.1)
    let variantClasses = "";
    switch (variant) {
      case "primary":
        variantClasses =
          "bg-brand-500 text-white shadow-xs hover:bg-brand-600 active:bg-brand-700 disabled:bg-neutral-300 disabled:text-neutral-500";
        break;
      case "secondary":
        variantClasses =
          "bg-neutral-0 text-neutral-900 border border-neutral-300 shadow-xs hover:bg-neutral-100 active:bg-neutral-200 disabled:border-neutral-200 disabled:text-neutral-500";
        break;
      case "destructive":
        variantClasses =
          "bg-status-danger text-white shadow-xs hover:bg-[#8C1D17] active:bg-[#68130E] disabled:bg-neutral-300 disabled:text-neutral-500";
        break;
      case "ghost":
        variantClasses =
          "bg-transparent text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 disabled:text-neutral-500";
        break;
      case "link":
        variantClasses =
          "bg-transparent text-brand-500 hover:underline p-0 h-auto font-medium disabled:text-neutral-500";
        break;
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${densityClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
