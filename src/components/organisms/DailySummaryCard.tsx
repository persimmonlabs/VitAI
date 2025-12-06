import React from 'react';
import { Card } from '@/components/atoms';
import { CalorieRing, MacroDisplay } from '@/components/molecules';

interface DailySummaryCardProps {
  consumed: number;
  target: number;
  protein: number;
  carbs: number;
  fat: number;
  proteinTarget?: number;
  carbsTarget?: number;
  fatTarget?: number;
  date?: Date;
}

export const DailySummaryCard: React.FC<DailySummaryCardProps> = ({
  consumed,
  target,
  protein,
  carbs,
  fat,
  proteinTarget,
  carbsTarget,
  fatTarget,
  date = new Date(),
}) => {
  const remaining = Math.max(0, target - consumed);
  const percentage = Math.min(100, (consumed / target) * 100);

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-6">
        {/* Date Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {formatDate(date)}
          </h2>
          <span className="text-sm text-gray-600">
            {date.toLocaleDateString('en-US', { weekday: 'long' })}
          </span>
        </div>

        {/* Calorie Ring */}
        <div className="flex items-center justify-center">
          <CalorieRing
            consumed={consumed}
            target={target}
            size="lg"
          />
        </div>

        {/* Remaining Calories */}
        <div className="text-center">
          {remaining > 0 ? (
            <>
              <p className="text-3xl font-bold text-gray-900">{remaining}</p>
              <p className="text-sm text-gray-600 mt-1">calories remaining</p>
            </>
          ) : consumed === target ? (
            <>
              <p className="text-2xl font-bold text-green-600">Perfect!</p>
              <p className="text-sm text-gray-600 mt-1">You hit your goal</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-orange-600">
                +{consumed - target}
              </p>
              <p className="text-sm text-gray-600 mt-1">calories over</p>
            </>
          )}
        </div>

        {/* Macros */}
        <div className="border-t pt-4">
          <MacroDisplay
            macros={{
              protein,
              carbs,
              fat,
              calories: consumed
            }}
            layout="horizontal"
            showCalories={false}
          />
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                percentage >= 100
                  ? percentage > 110
                    ? 'bg-red-600'
                    : 'bg-green-600'
                  : 'bg-primary-600'
              }`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700 min-w-[48px] text-right">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    </Card>
  );
};
