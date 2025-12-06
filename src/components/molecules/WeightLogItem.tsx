import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export interface WeightLogItemProps {
  id: string;
  date: Date;
  weight: number;
  unit: 'kg' | 'lb';
  previousWeight?: number;
  onClick?: () => void;
  className?: string;
}

export const WeightLogItem: React.FC<WeightLogItemProps> = ({
  date,
  weight,
  unit,
  previousWeight,
  onClick,
  className,
}) => {
  const change = previousWeight ? weight - previousWeight : 0;
  const changePercent = previousWeight ? ((change / previousWeight) * 100).toFixed(1) : null;

  const getTrendIcon = () => {
    if (change > 0) return TrendingUp;
    if (change < 0) return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (change > 0) return 'text-orange-600 dark:text-orange-400';
    if (change < 0) return 'text-green-600 dark:text-green-400';
    return 'text-gray-400 dark:text-gray-600';
  };

  const TrendIcon = getTrendIcon();

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800',
        onClick && 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex-1">
        <Text variant="body" weight="medium">
          {format(date, 'MMM d, yyyy')}
        </Text>
        <Text variant="caption" color="secondary" className="mt-0.5">
          {format(date, 'EEEE')}
        </Text>
      </div>

      <div className="text-right">
        <div className="flex items-baseline gap-1">
          <Text variant="h4" weight="bold">
            {weight.toFixed(1)}
          </Text>
          <Text variant="caption" color="secondary">
            {unit}
          </Text>
        </div>

        {previousWeight && change !== 0 && (
          <div className={cn('flex items-center justify-end gap-1 mt-1', getTrendColor())}>
            <Icon icon={TrendIcon} size="xs" />
            <Text variant="caption" className={getTrendColor()}>
              {change > 0 ? '+' : ''}
              {change.toFixed(1)} {unit}
              {changePercent && ` (${change > 0 ? '+' : ''}${changePercent}%)`}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

WeightLogItem.displayName = 'WeightLogItem';
