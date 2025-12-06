import type {
  WeightLog,
  WeightGoal,
  WeightTrend,
  GoalProgress,
  WeightUnit,
  TrendPeriod,
  GoalType,
} from './types';
import { GoalType as GoalTypeEnum } from './types';

// ============================================
// CONSTANTS
// ============================================

const CONVERSIONS = {
  KG_TO_LBS: 2.20462,
  LBS_TO_KG: 0.453592,
} as const;

// Safe weight loss/gain rates (kg per week)
const SAFE_RATES = {
  WEIGHT_LOSS: { min: 0.5, max: 1.0 },
  WEIGHT_GAIN: { min: 0.25, max: 0.5 },
} as const;

// ============================================
// WEIGHT CALCULATIONS
// ============================================

/**
 * Calculate weight change from first to last entry
 */
export function calculateWeightChange(logs: WeightLog[]): number {
  if (logs.length < 2) return 0;

  // Sort by date ascending
  const sorted = [...logs].sort((a, b) => a.logged_at.localeCompare(b.logged_at));
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;

  // Normalize to same unit (use last entry's unit)
  const firstWeight = normalizeWeight(first.weight_value, first.weight_unit, last.weight_unit);
  const change = last.weight_value - firstWeight;

  return Math.round(change * 10) / 10;
}

/**
 * Calculate weight trend for a specific period
 */
export function calculateWeightTrend(
  logs: WeightLog[],
  period: TrendPeriod
): WeightTrend | null {
  if (logs.length === 0) return null;

  // Calculate date cutoff
  const now = new Date();
  const cutoffDate = new Date(now);

  switch (period) {
    case '7d':
      cutoffDate.setDate(cutoffDate.getDate() - 7);
      break;
    case '30d':
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      break;
    case '90d':
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      break;
  }

  const cutoffStr = cutoffDate.toISOString().split('T')[0]!;

  // Filter logs within period
  const periodLogs = logs.filter(log => log.logged_at >= cutoffStr);

  if (periodLogs.length === 0) return null;

  // Normalize all weights to first entry's unit for consistency
  const targetUnit = periodLogs[0]!.weight_unit;
  const weights = periodLogs.map(log =>
    normalizeWeight(log.weight_value, log.weight_unit, targetUnit)
  );

  const sum = weights.reduce((acc, w) => acc + w, 0);
  const average = sum / weights.length;
  const min = Math.min(...weights);
  const max = Math.max(...weights);

  // Calculate change (first to last in period)
  const sorted = [...periodLogs].sort((a, b) => a.logged_at.localeCompare(b.logged_at));
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;

  const firstWeight = normalizeWeight(first.weight_value, first.weight_unit, targetUnit);
  const lastWeight = normalizeWeight(last.weight_value, last.weight_unit, targetUnit);
  const change = lastWeight - firstWeight;
  const changePercent = firstWeight > 0 ? (change / firstWeight) * 100 : 0;

  return {
    entries: periodLogs,
    average: Math.round(average * 10) / 10,
    min: Math.round(min * 10) / 10,
    max: Math.round(max * 10) / 10,
    change: Math.round(change * 10) / 10,
    changePercent: Math.round(changePercent * 10) / 10,
  };
}

/**
 * Calculate progress towards weight goal
 */
export function calculateGoalProgress(
  goal: WeightGoal,
  currentWeight: number,
  currentWeightUnit?: WeightUnit
): GoalProgress {
  // Normalize current weight to goal's unit
  const fromUnit = currentWeightUnit ?? goal.target_weight_unit;
  const normalized = normalizeWeight(currentWeight, fromUnit, goal.target_weight_unit);

  const start = goal.start_weight;
  const target = goal.target_weight;
  const current = normalized;

  // Calculate progress percentage
  const totalChange = target - start;
  const currentChange = current - start;
  const progress_percent = totalChange !== 0
    ? Math.min(100, Math.max(0, (currentChange / totalChange) * 100))
    : 0;

  // Estimate completion date
  const estimated_completion = estimateGoalCompletionDate(goal, current);

  // Check if on track
  const on_track = isOnTrack(goal, current, null);

  return {
    current: Math.round(current * 10) / 10,
    target: Math.round(target * 10) / 10,
    start: Math.round(start * 10) / 10,
    progress_percent: Math.round(progress_percent * 10) / 10,
    estimated_completion,
    on_track,
  };
}

/**
 * Estimate when goal will be completed based on current weight and recent trend
 */
export function estimateGoalCompletion(
  goal: WeightGoal,
  currentWeight: number,
  recentTrend: WeightTrend | null
): string | null {
  const remainingChange = Math.abs(goal.target_weight - currentWeight);

  if (remainingChange < 0.5) {
    // Goal essentially reached
    return new Date().toISOString().split('T')[0]!;
  }

  // Use trend if available, otherwise use safe average rate
  let weeklyRate: number;

  if (recentTrend && recentTrend.entries.length >= 2) {
    // Calculate weeks in trend period
    const sorted = [...recentTrend.entries].sort((a, b) =>
      a.logged_at.localeCompare(b.logged_at)
    );
    const firstDate = new Date(sorted[0]!.logged_at);
    const lastDate = new Date(sorted[sorted.length - 1]!.logged_at);
    const weeks = (lastDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000);

    if (weeks > 0) {
      weeklyRate = Math.abs(recentTrend.change) / weeks;
    } else {
      weeklyRate = getSafeWeeklyRate(goal.goal_type);
    }
  } else {
    weeklyRate = getSafeWeeklyRate(goal.goal_type);
  }

  if (weeklyRate === 0) return null;

  const weeksNeeded = Math.ceil(remainingChange / weeklyRate);
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + (weeksNeeded * 7));

  return estimatedDate.toISOString().split('T')[0]!;
}

/**
 * Estimate goal completion date (helper)
 */
function estimateGoalCompletionDate(
  goal: WeightGoal,
  currentWeight: number
): string | null {
  const remainingChange = Math.abs(goal.target_weight - currentWeight);

  if (remainingChange < 0.5) {
    return new Date().toISOString().split('T')[0]!;
  }

  const weeklyRate = getSafeWeeklyRate(goal.goal_type);
  if (weeklyRate === 0) return null;

  const weeksNeeded = Math.ceil(remainingChange / weeklyRate);
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + (weeksNeeded * 7));

  return estimatedDate.toISOString().split('T')[0]!;
}

/**
 * Check if user is on track to meet goal based on target date
 */
export function isOnTrack(
  goal: WeightGoal,
  currentWeight: number,
  _recentTrend: WeightTrend | null
): boolean {
  if (!goal.target_date) {
    // No target date, just check if moving in right direction
    if (goal.goal_type === GoalTypeEnum.MAINTENANCE) {
      return Math.abs(currentWeight - goal.target_weight) < 2;
    }

    const isMovingRight = goal.goal_type === GoalTypeEnum.WEIGHT_LOSS
      ? currentWeight <= goal.start_weight
      : currentWeight >= goal.start_weight;

    return isMovingRight;
  }

  const now = new Date();
  const startDate = new Date(goal.start_date);
  const targetDate = new Date(goal.target_date);

  // Calculate expected progress
  const totalDays = (targetDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000);
  const daysPassed = (now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000);

  if (totalDays <= 0) return false;

  const expectedProgress = daysPassed / totalDays;

  // Calculate actual progress
  const totalChange = goal.target_weight - goal.start_weight;
  const currentChange = currentWeight - goal.start_weight;
  const actualProgress = totalChange !== 0 ? currentChange / totalChange : 0;

  // Allow 10% margin
  return actualProgress >= (expectedProgress - 0.1);
}

// ============================================
// UNIT CONVERSIONS
// ============================================

/**
 * Normalize weight to target unit
 */
export function normalizeWeight(
  value: number,
  fromUnit: WeightUnit,
  toUnit: WeightUnit
): number {
  if (fromUnit === toUnit) return value;

  if (fromUnit === 'kg' && toUnit === 'lbs') {
    return Math.round(value * CONVERSIONS.KG_TO_LBS * 10) / 10;
  }

  // lbs to kg
  return Math.round(value * CONVERSIONS.LBS_TO_KG * 10) / 10;
}

// ============================================
// FORMATTING
// ============================================

/**
 * Format weight change for display
 */
export function formatWeightChange(
  change: number,
  unit: WeightUnit,
  locale: string = 'en'
): string {
  const sign = change >= 0 ? '+' : '';
  const formatted = `${sign}${change.toFixed(1)} ${unit}`;

  if (locale === 'pt-BR') {
    return formatted.replace('.', ',');
  }

  return formatted;
}

// ============================================
// HELPERS
// ============================================

/**
 * Get safe weekly rate for goal type
 */
function getSafeWeeklyRate(goalType: GoalType): number {
  switch (goalType) {
    case GoalTypeEnum.WEIGHT_LOSS:
      return (SAFE_RATES.WEIGHT_LOSS.min + SAFE_RATES.WEIGHT_LOSS.max) / 2;
    case GoalTypeEnum.WEIGHT_GAIN:
      return (SAFE_RATES.WEIGHT_GAIN.min + SAFE_RATES.WEIGHT_GAIN.max) / 2;
    case GoalTypeEnum.MAINTENANCE:
    default:
      return 0;
  }
}
