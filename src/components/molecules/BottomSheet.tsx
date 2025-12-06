import React from 'react';
import { Text } from '@/components/atoms/Text';
import { cn } from '@/lib/utils';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[];
  defaultSnap?: number;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = [0.9],
  defaultSnap = 0.9,
  className,
}) => {
  const [currentSnap, setCurrentSnap] = React.useState(defaultSnap);
  const sheetRef = React.useRef<HTMLDivElement>(null);

  const [{ y }, api] = useSpring(() => ({
    y: window.innerHeight,
  }));

  React.useEffect(() => {
    if (isOpen) {
      api.start({ y: window.innerHeight * (1 - currentSnap) });
      document.body.style.overflow = 'hidden';
    } else {
      api.start({ y: window.innerHeight });
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, currentSnap, api]);

  const bind = useDrag(
    ({ last, movement: [, my], direction: [, yDir], velocity: [, vy], cancel }) => {
      // If dragging up past the top snap point, cancel
      if (my < 0 && currentSnap === Math.max(...snapPoints)) {
        cancel();
        return;
      }

      if (last) {
        // Close if dragged down past threshold
        if (my > 100 || (yDir > 0 && vy > 0.5)) {
          onClose();
        } else {
          // Snap to nearest point
          const targetY = window.innerHeight * (1 - currentSnap) + my;
          const targetSnap = snapPoints.reduce((prev, curr) => {
            const prevY = window.innerHeight * (1 - prev);
            const currY = window.innerHeight * (1 - curr);
            return Math.abs(currY - targetY) < Math.abs(prevY - targetY) ? curr : prev;
          });
          setCurrentSnap(targetSnap);
          api.start({ y: window.innerHeight * (1 - targetSnap) });
        }
      } else {
        api.start({ y: window.innerHeight * (1 - currentSnap) + my, immediate: true });
      }
    },
    { from: () => [0, y.get()], filterTaps: true }
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <animated.div
        ref={sheetRef}
        style={{ y }}
        className={cn(
          'fixed inset-x-0 bottom-0 bg-white dark:bg-gray-900 rounded-t-2xl shadow-xl touch-none',
          'flex flex-col',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
      >
        {/* Drag handle */}
        <div {...bind()} className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" aria-hidden="true" />
        </div>

        {/* Title */}
        {title && (
          <div className="px-4 pb-2">
            <Text id="bottom-sheet-title" variant="h4" weight="semibold">
              {title}
            </Text>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {children}
        </div>
      </animated.div>
    </div>
  );
};

BottomSheet.displayName = 'BottomSheet';
