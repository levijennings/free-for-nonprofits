import React from 'react';

export type SkeletonVariant = 'text' | 'circle' | 'card' | 'rectangle';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className,
  ...props
}) => {
  const baseClasses = 'bg-gray-200 animate-pulse';

  const variantClasses: Record<SkeletonVariant, string> = {
    text: 'h-4 rounded',
    circle: 'rounded-full',
    card: 'rounded-lg',
    rectangle: 'rounded',
  };

  const getDefaultDimensions = (): { width: string; height: string } => {
    switch (variant) {
      case 'text':
        return { width: width ? String(width) : 'w-full', height: height ? String(height) : 'h-4' };
      case 'circle':
        return { width: width ? String(width) : 'w-12', height: height ? String(height) : 'h-12' };
      case 'card':
        return { width: width ? String(width) : 'w-full', height: height ? String(height) : 'h-40' };
      case 'rectangle':
        return { width: width ? String(width) : 'w-full', height: height ? String(height) : 'h-24' };
      default:
        return { width: String(width) || 'w-full', height: String(height) || 'h-4' };
    }
  };

  const dimensions = getDefaultDimensions();
  const widthClass = typeof width === 'string' ? width : dimensions.width;
  const heightClass = typeof height === 'string' ? height : dimensions.height;

  const skeletonClass = `${baseClasses} ${variantClasses[variant]} ${widthClass} ${heightClass} ${className || ''}`;

  if (count > 1) {
    return (
      <div className="space-y-2" {...props}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={skeletonClass} />
        ))}
      </div>
    );
  }

  return <div className={skeletonClass} {...props} />;
};

Skeleton.displayName = 'Skeleton';
