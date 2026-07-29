import { cn } from "@/lib/cn";
import { Button } from "./Button";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: { label: string; onClick?: () => void; href?: string };
  secondaryAction?: { label: string; onClick?: () => void; href?: string };
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  secondaryAction,
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div className={cn("px-6 py-12 text-center", className)} {...rest}>
      {icon && <div className="mx-auto mb-4 text-fg-subtle">{icon}</div>}
      <h3 className="text-h3 font-semibold text-fg">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-sm text-sm text-fg-muted text-pretty">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {action &&
            (action.href ? (
              <a href={action.href}>
                <Button size="md">{action.label}</Button>
              </a>
            ) : (
              <Button size="md" onClick={action.onClick}>
                {action.label}
              </Button>
            ))}
          {secondaryAction &&
            (secondaryAction.href ? (
              <a href={secondaryAction.href}>
                <Button size="md" variant="secondary">
                  {secondaryAction.label}
                </Button>
              </a>
            ) : (
              <Button size="md" variant="secondary" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            ))}
        </div>
      )}
    </div>
  );
}
