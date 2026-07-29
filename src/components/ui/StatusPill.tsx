import { cn } from "@/lib/cn";

/** The four states a claim moves through. This is the mechanism that makes
 *  an account structurally necessary rather than rhetorically requested. */
export type ClaimStatus = "none" | "gathering" | "applied" | "approved";

export const CLAIM_STATUS_LABEL: Record<ClaimStatus, string> = {
  none: "Not started",
  gathering: "Gathering docs",
  applied: "Applied",
  approved: "Approved",
};

const DOT: Record<ClaimStatus, string> = {
  none: "bg-status-none",
  gathering: "bg-status-progress",
  applied: "bg-status-progress",
  approved: "bg-status-done",
};

export interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: ClaimStatus;
  /** Renders the label alongside the dot. Status is never colour-only. */
  showLabel?: boolean;
}

export function StatusPill({ status, showLabel = true, className, ...rest }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-fg-muted",
        className
      )}
      {...rest}
    >
      <span className={cn("h-2 w-2 shrink-0 rounded-full", DOT[status])} aria-hidden="true" />
      {showLabel ? CLAIM_STATUS_LABEL[status] : <span className="sr-only">{CLAIM_STATUS_LABEL[status]}</span>}
    </span>
  );
}
