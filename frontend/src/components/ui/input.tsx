import React from "react";
import { AlertCircle } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  density?: "comfortable" | "compact";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      error,
      helperText,
      density = "comfortable",
      className = "",
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
    const errorId = inputId ? `${inputId}-error` : undefined;
    const helperId = inputId ? `${inputId}-helper` : undefined;

    const heightClass = density === "comfortable" ? "h-10 text-sm px-3" : "h-8 text-xs px-2.5";

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-neutral-700"
          >
            {label} {required && <span className="text-status-danger" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`w-full rounded-sm border bg-neutral-0 text-neutral-900 placeholder:text-neutral-500 transition-colors focus:outline-none ${heightClass} ${
              error
                ? "border-status-danger focus:border-status-danger focus:ring-2 focus:ring-status-danger-border pr-9"
                : "border-neutral-300 hover:border-neutral-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            } disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed ${className}`}
            {...props}
          />
          {error && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
              <AlertCircle className="w-4 h-4 text-status-danger" aria-hidden="true" />
            </div>
          )}
        </div>

        {error ? (
          <p id={errorId} className="text-xs text-status-danger font-medium flex items-center gap-1">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-neutral-700">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
