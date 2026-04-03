import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  placeholder?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, placeholder, error, options, className, ...props }, ref) => {
    const baseClasses =
      'w-full appearance-none border rounded-lg px-4 py-2 pr-10 text-base font-[family-name:var(--font-plus-jakarta-sans)] bg-white cursor-pointer transition-colors duration-200';
    const defaultStateClasses =
      'border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    const errorStateClasses = 'border-red-500 bg-red-50 text-gray-900 focus:ring-red-500';

    const selectClasses = `${baseClasses} ${error ? errorStateClasses : defaultStateClasses} ${className || ''}`;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            className={selectClasses}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled selected>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        {error && (
          <p id={`${props.id}-error`} className="text-sm text-red-500 mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
