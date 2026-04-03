import React, { forwardRef } from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  initials?: string;
  size?: AvatarSize;
  alt: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

const fallbackClasses =
  'flex items-center justify-center bg-blue-100 text-blue-800 font-semibold rounded-full';

export const Avatar = forwardRef<HTMLImageElement, AvatarProps>(
  ({ src, initials, size = 'md', alt, className, ...props }, ref) => {
    const baseSize = sizeClasses[size];

    if (src) {
      return (
        <img
          ref={ref}
          src={src}
          alt={alt}
          className={`${baseSize} rounded-full object-cover ${className || ''}`}
          {...props}
        />
      );
    }

    return (
      <div
        className={`${baseSize} ${fallbackClasses} ${className || ''}`}
        role="img"
        aria-label={alt}
      >
        {initials}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
