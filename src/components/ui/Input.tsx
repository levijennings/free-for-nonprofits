import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export type InputSize = "md" | "lg";
export type InputVariant = "default";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { inputSize = "md", className, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-md border border-line-strong bg-surface text-fg",
        "placeholder:text-fg-subtle",
        "transition-colors duration-fast ease-out hover:border-fg-subtle",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        "aria-[invalid=true]:border-status-warn",
        "disabled:bg-surface-inset disabled:text-fg-subtle disabled:cursor-not-allowed",
        inputSize === "lg" ? "px-3.5 py-3 text-base" : "px-3.5 py-2.5 text-sm",
        className
      )}
      {...rest}
    />
  );
});
