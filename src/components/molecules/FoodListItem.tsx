import React from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

export interface FoodListItemProps {
  id: string;
  name: string;
  brand?: string;
  servingSize: string;
  calories: number;
  onQuickAdd?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const FoodListItem: React.FC<FoodListItemProps> = ({
  name,
  brand,
  servingSize,
  calories,
  onQuickAdd,
  onView,
  onDelete,
  className,
}) => {
  const [{ x }, api] = useSpring(() => ({ x: 0 }));
  const [isSwipeOpen, setIsSwipeOpen] = React.useState(false);

  const bind = useDrag(
    ({ last, movement: [mx], direction: [xDir], cancel, velocity: [vx] }) => {
      // Only allow swipe on touch devices (mobile)
      if (!('ontouchstart' in window)) return;

      if (last) {
        // Swipe threshold
        if (Math.abs(mx) > 80 || vx > 0.5) {
          const shouldOpen = xDir < 0;
          api.start({ x: shouldOpen ? -80 : 0 });
          setIsSwipeOpen(shouldOpen);
        } else {
          api.start({ x: 0 });
          setIsSwipeOpen(false);
        }
      } else {
        api.start({ x: mx > 0 ? 0 : Math.max(mx, -80), immediate: true });
      }
    },
    { axis: 'x', filterTaps: true }
  );

  const handleDelete = () => {
    api.start({ x: 0 });
    setIsSwipeOpen(false);
    onDelete?.();
  };

  React.useEffect(() => {
    if (!isSwipeOpen) {
      api.start({ x: 0 });
    }
  }, [isSwipeOpen, api]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Delete button (revealed on swipe) */}
      {onDelete && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center">
          <button
            onClick={handleDelete}
            className="h-full px-6 bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
            aria-label="Delete food"
          >
            Delete
          </button>
        </div>
      )}

      {/* Main content */}
      <animated.div
        {...bind()}
        style={{ x }}
        className="touch-pan-y bg-white dark:bg-gray-900"
      >
        <div
          className={cn(
            'flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800',
            'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer'
          )}
          onClick={onView}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onView?.();
            }
          }}
        >
          <div className="flex-1 min-w-0">
            <Text variant="body" weight="medium" truncate>
              {name}
            </Text>
            {brand && (
              <Text variant="caption" color="secondary" truncate className="mt-0.5">
                {brand}
              </Text>
            )}
            <Text variant="caption" color="muted" className="mt-1">
              {servingSize}
            </Text>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <Text variant="body" weight="semibold">
                {calories}
              </Text>
              <Text variant="caption" color="secondary">
                kcal
              </Text>
            </div>

            {onQuickAdd && (
              <Button
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAdd();
                }}
                className="h-9 w-9 p-0 shrink-0"
                aria-label="Quick add food"
              >
                <Icon icon={Plus} size="sm" />
              </Button>
            )}

            {onView && (
              <Icon
                icon={ChevronRight}
                size="sm"
                className="text-gray-400 dark:text-gray-600 shrink-0"
              />
            )}
          </div>
        </div>
      </animated.div>
    </div>
  );
};

FoodListItem.displayName = 'FoodListItem';
