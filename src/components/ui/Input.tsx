import React, { forwardRef } from 'react';
import { Search } from 'lucide-react';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'search';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: InputSize;
  variant?: InputVariant;
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

const baseInputClasses =
  'w-full border rounded-lg font-[family-name:var(--font-plus-jakarta-sans)] transition-colors duration-200';
const defaultStateClasses =
  'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const errorStateClasses = 'border-red-500 bg-red-50 text-gray-900 focus:ring-red-500';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      variant = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const inputClasses = `${baseInputClasses} ${sizeClasses[size]} ${
      error ? errorStateClasses : defaultStateClasses
    } ${className || ''}`;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {variant === 'search' && (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          )}

          <input
            ref={ref}
            className={`${inputClasses} ${variant === 'search' ? 'pl-10' : ''}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
            {...props}
          />
        </div>

        {error && (
          <p id={`${props.id}-error`} className="text-sm text-red-500 mt-1">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${props.id}-helper`} className="text-sm text-gray-500 mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
