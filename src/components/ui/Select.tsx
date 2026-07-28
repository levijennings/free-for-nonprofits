import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, placeholder, className, ...rest },
  ref
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "w-full appearance-none rounded-md border border-line-strong bg-surface text-fg",
          "px-3.5 py-2.5 pr-9 text-sm cursor-pointer",
          "transition-colors duration-fast ease-out hover:border-fg-subtle",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
          "disabled:bg-surface-inset disabled:text-fg-subtle disabled:cursor-not-allowed",
          className
        )}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
});
