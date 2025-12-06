import React from 'react';
import { Text } from '@/components/atoms/Text';
import { cn } from '@/lib/utils';

export interface CalorieRingProps {
  consumed: number;
  target: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const CalorieRing: React.FC<CalorieRingProps> = ({
  consumed,
  target,
  size = 200,
  strokeWidth = 12,
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min((consumed / target) * 100, 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const remaining = Math.max(target - consumed, 0);
  const isOverTarget = consumed > target;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="meter"
      aria-valuenow={consumed}
      aria-valuemin={0}
      aria-valuemax={target}
      aria-label={`Calories: ${consumed} of ${target}`}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-800"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-500 ease-out',
            isOverTarget ? 'text-red-500' : 'text-blue-600'
          )}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Text variant="h3" weight="bold" className="leading-none">
          {Math.round(remaining)}
        </Text>
        <Text variant="caption" color="secondary" className="mt-1">
          {isOverTarget ? 'over' : 'remaining'}
        </Text>
      </div>
    </div>
  );
};

CalorieRing.displayName = 'CalorieRing';
