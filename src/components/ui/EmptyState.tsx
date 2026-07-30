import { cn } from "@/lib/cn";
import { Button, buttonClasses } from "./Button";
import type { ButtonVariant } from "./Button";

interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
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
      {icon && <div className="mx-auto mb-4 text-fg-subtle" aria-hidden="true">{icon}</div>}
      <h3 className="text-h3 font-semibold text-fg">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-sm text-sm text-fg-muted text-pretty">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {action && <ActionControl action={action} />}
          {secondaryAction && <ActionControl action={secondaryAction} variant="secondary" />}
        </div>
      )}
    </div>
  );
}

/**
 * One action, one control.
 *
 * An `href` action renders a single <a> wearing the button styles, rather than
 * a <Button> inside an <a>. That nesting is invalid interactive content: it
 * gave the user two tab stops for one action, and Enter on the inner control
 * did nothing at all, because a <button type="button"> has no default
 * activation behaviour and the keypress never reached the link.
 */
function ActionControl({
  action,
  variant = "primary",
}: {
  action: EmptyStateAction;
  variant?: ButtonVariant;
}) {
  if (action.href) {
    return (
      <a href={action.href} className={buttonClasses({ variant, size: "md" })}>
        {action.label}
      </a>
    );
  }

  return (
    <Button size="md" variant={variant} onClick={action.onClick}>
      {action.label}
    </Button>
  );
}
