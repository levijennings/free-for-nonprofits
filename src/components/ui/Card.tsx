import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `accent` is for the conversion surfaces — scorecard, next-best-claim. */
  tone?: "default" | "subtle" | "accent";
  interactive?: boolean;
}
export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;
export type CardBodyProps = React.HTMLAttributes<HTMLDivElement>;
export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

const TONE = {
  default: "bg-surface-raised border-line",
  subtle: "bg-surface-subtle border-line",
  accent: "bg-accent-subtle border-accent-line",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { tone = "default", interactive, className, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border",
        TONE[tone],
        interactive &&
          "transition-shadow duration-fast ease-out hover:shadow-2 focus-within:shadow-2",
        className
      )}
      {...rest}
    />
  );
});

export function CardHeader({ className, ...rest }: CardHeaderProps) {
  return <div className={cn("border-b border-line px-5 py-4", className)} {...rest} />;
}
export function CardBody({ className, ...rest }: CardBodyProps) {
  return <div className={cn("p-5", className)} {...rest} />;
}
export function CardFooter({ className, ...rest }: CardFooterProps) {
  return <div className={cn("border-t border-line px-5 py-4", className)} {...rest} />;
}
