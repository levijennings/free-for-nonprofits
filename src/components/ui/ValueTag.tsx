import { cn } from "@/lib/cn";

export interface ValueTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Annual value in whole dollars. */
  amount: number;
  period?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-[1.7rem] leading-none",
};

/**
 * Money set in tabular mono. The same figure in a bold marketing sans reads as
 * a claim; in mono it reads as a computed result. That distinction matters for
 * an audience whose job is evaluating the credibility of claims.
 */
export function ValueTag({ amount, period = "/ year", size = "md", className, ...rest }: ValueTagProps) {
  return (
    <span className={cn("tnum font-semibold text-fg", SIZE[size], className)} {...rest}>
      {"$" + amount.toLocaleString("en-US")}
      {period && (
        <span className="ml-1 text-sm font-medium text-fg-muted">{period}</span>
      )}
    </span>
  );
}
