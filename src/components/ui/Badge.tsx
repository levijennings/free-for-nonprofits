import { cn } from "@/lib/cn";

export type BadgeVariant = "neutral" | "accent" | "free" | "freemium" | "discount" | "warn";

const VARIANT: Record<BadgeVariant, string> = {
  neutral: "bg-surface-inset text-fg-muted border-line",
  accent: "bg-accent-subtle text-accent border-accent-line",
  free: "bg-status-done-bg text-status-done border-accent-line",
  freemium: "bg-surface-inset text-fg-muted border-line",
  discount: "bg-status-progress-bg text-status-progress border-status-progress/30",
  warn: "bg-status-warn-bg text-status-warn border-status-warn/30",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "neutral", className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        VARIANT[variant],
        className
      )}
      {...rest}
    />
  );
}
