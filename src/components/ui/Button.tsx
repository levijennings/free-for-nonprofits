import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
  // 5.5:1 white-on-fill. Hover darkens — never lightens.
  primary: "bg-accent text-accent-fg hover:bg-accent-hover border-transparent",
  secondary: "bg-surface text-fg border-line-strong hover:bg-surface-subtle",
  ghost: "bg-transparent text-fg-muted border-transparent hover:bg-surface-subtle hover:text-fg",
  destructive: "bg-status-warn text-white border-transparent hover:brightness-90",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-[18px] py-[11px] text-sm gap-2",
  lg: "px-6 py-3.5 text-base gap-2",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, loadingText, fullWidth, className, children, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-md border font-semibold tracking-[-0.01em]",
        "transition-colors duration-fast ease-out",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        // Not opacity-50 — that dropped the primary to roughly 1.5:1.
        "disabled:cursor-not-allowed disabled:bg-surface-inset disabled:text-fg-subtle disabled:border-line",
        VARIANT[variant],
        SIZE[size],
        fullWidth && "w-full",
        className
      )}
      {...rest}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity=".25" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )}
      {loading ? loadingText ?? children : children}
    </button>
  );
});
