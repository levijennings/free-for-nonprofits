import React from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'info' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-cyan-100 text-cyan-800',
  outline: 'border border-gray-300 text-gray-700 bg-white',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', className, children, ...props }) => {
  const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium';
  const badgeClasses = `${baseClasses} ${variantClasses[variant]} ${className || ''}`;

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';
