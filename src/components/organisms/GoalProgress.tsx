import React from 'react';
import { TrendingDown, TrendingUp, Target, Calendar } from 'lucide-react';
import { Card, ProgressBar, Badge } from '@/components/atoms';

interface GoalProgressProps {
  currentWeight: number;
  targetWeight: number;
  startWeight?: number;
  startDate?: Date;
  targetDate?: Date;
  unit?: 'kg' | 'lbs';
}

export const GoalProgress: React.FC<GoalProgressProps> = ({
  currentWeight,
  targetWeight,
  startWeight,
  startDate,
  targetDate,
  unit = 'kg',
}) => {
  const effectiveStartWeight = startWeight || currentWeight;
  const totalWeightChange = effectiveStartWeight - targetWeight;
  const currentProgress = effectiveStartWeight - currentWeight;
  const remainingWeight = currentWeight - targetWeight;

  const progressPercentage = totalWeightChange !== 0
    ? Math.max(0, Math.min(100, (currentProgress / totalWeightChange) * 100))
    : 0;

  const isWeightLoss = targetWeight < effectiveStartWeight;
  const isGoalReached = isWeightLoss
    ? currentWeight <= targetWeight
    : currentWeight >= targetWeight;

  // Calculate estimated completion date
  const getEstimatedCompletion = (): string | null => {
    if (!startDate || !targetDate || currentProgress === 0 || totalWeightChange === 0) {
      return null;
    }

    const now = new Date();
    const daysSinceStart = Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const weightPerDay = currentProgress / daysSinceStart;

    if (weightPerDay <= 0) return null;

    const remainingDays = Math.ceil(Math.abs(remainingWeight) / Math.abs(weightPerDay));
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + remainingDays);

    return estimatedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const estimatedCompletion = getEstimatedCompletion();

  // Calculate average rate
  const getAverageRate = (): string | null => {
    if (!startDate || currentProgress === 0) return null;

    const now = new Date();
    const daysSinceStart = Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const weightPerWeek = (currentProgress / daysSinceStart) * 7;

    return `${Math.abs(weightPerWeek).toFixed(1)} ${unit}/week`;
  };

  const averageRate = getAverageRate();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isGoalReached ? 'bg-green-100' : 'bg-primary-100'
          }`}>
            <Target className={`h-6 w-6 ${
              isGoalReached ? 'text-green-600' : 'text-primary-600'
            }`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Goal Progress</h3>
            <p className="text-sm text-gray-600">
              {isGoalReached ? 'Goal achieved!' : 'Keep going!'}
            </p>
          </div>
        </div>
        {isGoalReached && (
          <Badge variant="success" className="px-3 py-1">
            Completed
          </Badge>
        )}
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Current</p>
          <p className="text-2xl font-bold text-gray-900">
            {currentWeight.toFixed(1)}
          </p>
          <p className="text-xs text-gray-600 mt-1">{unit}</p>
        </div>
        <div className="text-center p-4 bg-primary-50 rounded-lg">
          <p className="text-xs text-primary-700 mb-1">Target</p>
          <p className="text-2xl font-bold text-primary-700">
            {targetWeight.toFixed(1)}
          </p>
          <p className="text-xs text-primary-700 mt-1">{unit}</p>
        </div>
        <div className={`text-center p-4 rounded-lg ${
          isGoalReached ? 'bg-green-50' : 'bg-orange-50'
        }`}>
          <p className={`text-xs mb-1 ${
            isGoalReached ? 'text-green-700' : 'text-orange-700'
          }`}>
            {isGoalReached ? 'Achieved' : 'Remaining'}
          </p>
          <p className={`text-2xl font-bold ${
            isGoalReached ? 'text-green-700' : 'text-orange-700'
          }`}>
            {isGoalReached ? '0.0' : Math.abs(remainingWeight).toFixed(1)}
          </p>
          <p className={`text-xs mt-1 ${
            isGoalReached ? 'text-green-700' : 'text-orange-700'
          }`}>
            {unit}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-primary-600">
            {progressPercentage.toFixed(0)}%
          </span>
        </div>
        <ProgressBar
          value={progressPercentage}
          max={100}
          variant={isGoalReached ? 'success' : 'primary'}
          size="lg"
          showLabel={false}
        />
      </div>

      {/* Details Grid */}
      <div className="space-y-3">
        {/* Weight Change */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {isWeightLoss ? (
              <TrendingDown className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingUp className="h-5 w-5 text-blue-600" />
            )}
            <span className="text-sm font-medium text-gray-700">Total Change</span>
          </div>
          <span className={`text-sm font-bold ${
            currentProgress !== 0
              ? isWeightLoss
                ? 'text-green-600'
                : 'text-blue-600'
              : 'text-gray-900'
          }`}>
            {currentProgress > 0 ? '-' : currentProgress < 0 ? '+' : ''}
            {Math.abs(currentProgress).toFixed(1)} {unit}
          </span>
        </div>

        {/* Average Rate */}
        {averageRate && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Average Rate</span>
            <span className="text-sm font-bold text-gray-900">
              {averageRate}
            </span>
          </div>
        )}

        {/* Estimated Completion */}
        {!isGoalReached && estimatedCompletion && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Estimated Goal Date
              </span>
            </div>
            <span className="text-sm font-bold text-blue-700">
              {estimatedCompletion}
            </span>
          </div>
        )}

        {/* Target Date */}
        {targetDate && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Target Date</span>
            <span className="text-sm font-bold text-gray-900">
              {targetDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>

      {/* Motivational Message */}
      {!isGoalReached && (
        <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-200">
          <p className="text-sm text-primary-900 font-medium">
            {progressPercentage >= 75
              ? '🎉 Almost there! Keep up the great work!'
              : progressPercentage >= 50
              ? '💪 You\'re halfway there! Stay consistent!'
              : progressPercentage >= 25
              ? '🌟 Great start! Every step counts!'
              : '🚀 Begin your journey! Small changes lead to big results!'}
          </p>
        </div>
      )}

      {isGoalReached && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-900 font-medium">
            🎊 Congratulations! You've reached your goal! Now focus on maintaining your progress.
          </p>
        </div>
      )}
    </Card>
  );
};
