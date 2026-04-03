import React, { useState } from 'react';
import { Star } from 'lucide-react';

export interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  interactive?: boolean;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRate,
  interactive = false,
  showText = true,
  size = 'md',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;
  const fullStars = Math.floor(displayRating);
  const hasHalfStar = displayRating % 1 >= 0.5;

  const handleStarClick = (index: number) => {
    if (interactive && onRate) {
      onRate(index + 1);
    }
  };

  const handleStarHover = (index: number) => {
    if (interactive) {
      setHoverRating(index + 1);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(null);
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5" onMouseLeave={handleMouseLeave}>
        {[0, 1, 2, 3, 4].map((index) => {
          const isFilled = index < fullStars;
          const isHalf = index === fullStars && hasHalfStar;

          return (
            <div key={index} className="relative">
              <button
                onClick={() => handleStarClick(index)}
                onMouseEnter={() => handleStarHover(index)}
                className={`${sizeClasses[size]} transition-colors ${
                  interactive ? 'cursor-pointer hover:text-yellow-400' : 'cursor-default'
                }`}
                aria-label={`${index + 1} stars`}
                type="button"
              >
                <Star
                  className={`w-full h-full ${
                    isFilled
                      ? 'fill-yellow-400 text-yellow-400'
                      : isHalf
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      {showText && (
        <span className="ml-2 text-sm text-gray-600 font-medium">{displayRating.toFixed(1)}</span>
      )}
    </div>
  );
};

StarRating.displayName = 'StarRating';
