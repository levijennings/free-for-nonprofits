"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

export interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  /** Receives the generated ids. Spread `field` onto the control. */
  children: (field: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": boolean | undefined;
    required: boolean | undefined;
  }) => React.ReactNode;
}

/**
 * Binds a <label> to its control by generated id, and wires hint/error text
 * through aria-describedby.
 *
 * The whole codebase contained two `htmlFor` attributes, one of which was on
 * the signup honeypot — so the only correctly labelled input in the product
 * was the invisible one meant for bots. Routing every control through this
 * component makes that class of defect structurally impossible.
 */
export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const base = useId();
  const id = `${base}-input`;
  const hintId = hint ? `${base}-hint` : undefined;
  const errorId = error ? `${base}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-semibold text-fg">
        {label}
        {required && (
          <span className="text-status-warn" aria-hidden="true">
            {" "}
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>

      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        required: required || undefined,
      })}

      {error && (
        <p id={errorId} role="alert" className="text-xs text-status-warn">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="text-xs text-fg-subtle">
          {hint}
        </p>
      )}
    </div>
  );
}
