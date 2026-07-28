import { cn } from "@/lib/cn";

export type SkeletonVariant = "text" | "block" | "circle";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
}

const VARIANT: Record<SkeletonVariant, string> = {
  text: "h-4 rounded-sm",
  block: "rounded-md",
  circle: "rounded-full",
};

export function Skeleton({ variant = "block", className, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse bg-surface-inset", VARIANT[variant], className)}
      {...rest}
    />
  );
}

/** Matches the programme row so the swap to real content doesn't shift layout. */
export function ProgramRowSkeleton() {
  return (
    <div className="flex items-center gap-3.5 border-b border-line px-[18px] py-[15px] last:border-0">
      <Skeleton variant="circle" className="h-2 w-2 shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton variant="text" className="w-1/3" />
        <Skeleton variant="text" className="h-3 w-1/2" />
      </div>
      <Skeleton variant="text" className="h-5 w-20 shrink-0" />
    </div>
  );
}
