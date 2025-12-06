import { describe, it, expect } from 'vitest';
import {
  calculateWeightChange,
  calculateWeightTrend,
  calculateGoalProgress,
  estimateGoalCompletion,
  isOnTrack,
  normalizeWeight,
  formatWeightChange,
} from '../service';
import type { WeightLog, WeightGoal, WeightTrend } from '../types';
import { WeightUnit, GoalType, GoalStatus } from '../types';

describe('Weight Service', () => {
  describe('normalizeWeight', () => {
    it('converts kg to lbs correctly', () => {
      expect(normalizeWeight(1, WeightUnit.KG, WeightUnit.LBS)).toBe(2.2);
      expect(normalizeWeight(10, WeightUnit.KG, WeightUnit.LBS)).toBe(22);
      expect(normalizeWeight(80, WeightUnit.KG, WeightUnit.LBS)).toBe(176.4);
    });

    it('converts lbs to kg correctly', () => {
      expect(normalizeWeight(2.2, WeightUnit.LBS, WeightUnit.KG)).toBe(1);
      expect(normalizeWeight(100, WeightUnit.LBS, WeightUnit.KG)).toBe(45.4);
      expect(normalizeWeight(176, WeightUnit.LBS, WeightUnit.KG)).toBe(79.8);
    });

    it('returns same value when units match', () => {
      expect(normalizeWeight(80, WeightUnit.KG, WeightUnit.KG)).toBe(80);
      expect(normalizeWeight(176, WeightUnit.LBS, WeightUnit.LBS)).toBe(176);
    });
  });

  describe('calculateWeightChange', () => {
    it('returns 0 for empty logs', () => {
      expect(calculateWeightChange([])).toBe(0);
    });

    it('returns 0 for single log', () => {
      const logs: WeightLog[] = [
        {
          id: '1',
          user_id: 'user-1',
          weight_value: 80,
          weight_unit: WeightUnit.KG,
          logged_at: '2025-01-01',
        },
      ];
      expect(calculateWeightChange(logs)).toBe(0);
    });

    it('calculates weight loss correctly', () => {
      const logs: WeightLog[] = [
        {
          id: '1',
          user_id: 'user-1',
          weight_value: 85,
          weight_unit: WeightUnit.KG,
          logged_at: '2025-01-01',
        },
        {
          id: '2',
          user_id: 'user-1',
          weight_value: 80,
          weight_unit: WeightUnit.KG,
          logged_at: '2025-02-01',
        },
      ];
      expect(calculateWeightChange(logs)).toBe(-5);
    });

    it('calculates weight gain correctly', () => {
      const logs: WeightLog[] = [
        {
          id: '1',
          user_id: 'user-1',
          weight_value: 70,
          weight_unit: WeightUnit.KG,
          logged_at: '2025-01-01',
        },
        {
          id: '2',
          user_id: 'user-1',
          weight_value: 75,
          weight_unit: WeightUnit.KG,
          logged_at: '2025-02-01',
        },
      ];
      expect(calculateWeightChange(logs)).toBe(5);
    });

    it('handles unsorted logs', () => {
      const logs: WeightLog[] = [
        {
          id: '2',
          user_id: 'user-1',
          weight_value: 80,
          weight_unit: WeightUnit.KG,
          logged_at: '2025-02-01',
        },
        {
          id: '1',
          user_id: 'user-1',
          weight_value: 85,
          weight_unit: WeightUnit.KG,
          logged_at: '2025-01-01',
        },
      ];
      expect(calculateWeightChange(logs)).toBe(-5);
    });

    it('normalizes units before calculating', () => {
      const logs: WeightLog[] = [
        {
          id: '1',
          user_id: 'user-1',
          weight_value: 176.4, // ~80 kg
          weight_unit: WeightUnit.LBS,
          logged_at: '2025-01-01',
        },
        {
          id: '2',
          user_id: 'user-1',
          weight_value: 75,
          weight_unit: WeightUnit.KG,
          logged_at: '2025-02-01',
        },
      ];
      // Should normalize first entry to kg before calculating
      expect(calculateWeightChange(logs)).toBe(-5);
    });
  });

  describe('calculateWeightTrend', () => {
    const createLog = (weight: number, daysAgo: number): WeightLog => {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      return {
        id: `log-${daysAgo}`,
        user_id: 'user-1',
        weight_value: weight,
        weight_unit: WeightUnit.KG,
        logged_at: date.toISOString().split('T')[0]!,
      };
    };

    it('returns null for empty logs', () => {
      expect(calculateWeightTrend([], '7d')).toBeNull();
    });

    it('returns null when no logs in period', () => {
      const logs = [createLog(80, 30)]; // 30 days ago
      expect(calculateWeightTrend(logs, '7d')).toBeNull();
    });

    it('calculates 7-day trend correctly', () => {
      const logs = [
        createLog(82, 6),
        createLog(81, 4),
        createLog(80, 2),
        createLog(79, 0),
      ];
      const trend = calculateWeightTrend(logs, '7d');

      expect(trend).not.toBeNull();
      expect(trend!.entries.length).toBe(4);
      expect(trend!.average).toBeCloseTo(80.5, 1);
      expect(trend!.min).toBe(79);
      expect(trend!.max).toBe(82);
      expect(trend!.change).toBe(-3); // 82 -> 79
      expect(trend!.changePercent).toBeCloseTo(-3.7, 1);
    });

    it('calculates 30-day trend correctly', () => {
      const logs = [
        createLog(85, 29),
        createLog(83, 20),
        createLog(81, 10),
        createLog(80, 1),
      ];
      const trend = calculateWeightTrend(logs, '30d');

      expect(trend).not.toBeNull();
      expect(trend!.entries.length).toBe(4);
      expect(trend!.change).toBe(-5);
    });

    it('filters logs outside period', () => {
      const logs = [
        createLog(90, 100), // 100 days ago - should be excluded
        createLog(85, 5),
        createLog(80, 1),
      ];
      const trend = calculateWeightTrend(logs, '7d');

      expect(trend).not.toBeNull();
      expect(trend!.entries.length).toBe(2); // Only last 2
    });
  });

  describe('calculateGoalProgress', () => {
    it('calculates weight loss progress correctly', () => {
      const goal: WeightGoal = {
        id: 'goal-1',
        user_id: 'user-1',
        goal_type: GoalType.WEIGHT_LOSS,
        target_weight: 75,
        target_weight_unit: WeightUnit.KG,
        target_date: '2025-06-01',
        start_weight: 85,
        start_date: '2025-01-01',
        status: GoalStatus.ACTIVE,
      };

      const progress = calculateGoalProgress(goal, 80);

      expect(progress.start).toBe(85);
      expect(progress.target).toBe(75);
      expect(progress.current).toBe(80);
      expect(progress.progress_percent).toBe(50); // Lost 5 of 10 kg
    });

    it('calculates weight gain progress correctly', () => {
      const goal: WeightGoal = {
        id: 'goal-1',
        user_id: 'user-1',
        goal_type: GoalType.WEIGHT_GAIN,
        target_weight: 80,
        target_weight_unit: WeightUnit.KG,
        target_date: '2025-06-01',
        start_weight: 70,
        start_date: '2025-01-01',
        status: GoalStatus.ACTIVE,
      };

      const progress = calculateGoalProgress(goal, 75);

      expect(progress.start).toBe(70);
      expect(progress.target).toBe(80);
      expect(progress.current).toBe(75);
      expect(progress.progress_percent).toBe(50); // Gained 5 of 10 kg
    });

    it('caps progress at 100%', () => {
      const goal: WeightGoal = {
        id: 'goal-1',
        user_id: 'user-1',
        goal_type: GoalType.WEIGHT_LOSS,
        target_weight: 75,
        target_weight_unit: WeightUnit.KG,
        target_date: null,
        start_weight: 85,
        start_date: '2025-01-01',
        status: GoalStatus.ACTIVE,
      };

      const progress = calculateGoalProgress(goal, 70); // Beyond goal
      expect(progress.progress_percent).toBe(100);
    });

    it('prevents negative progress', () => {
      const goal: WeightGoal = {
        id: 'goal-1',
        user_id: 'user-1',
        goal_type: GoalType.WEIGHT_LOSS,
        target_weight: 75,
        target_weight_unit: WeightUnit.KG,
        target_date: null,
        start_weight: 85,
        start_date: '2025-01-01',
        status: GoalStatus.ACTIVE,
      };

      const progress = calculateGoalProgress(goal, 90); // Gained weight
      expect(progress.progress_percent).toBe(0);
    });

    it('normalizes current weight to goal unit', () => {
      const goal: WeightGoal = {
        id: 'goal-1',
        user_id: 'user-1',
        goal_type: GoalType.WEIGHT_LOSS,
        target_weight: 165, // lbs
        target_weight_unit: WeightUnit.LBS,
        target_date: null,
        start_weight: 187, // lbs (85 kg)
        start_date: '2025-01-01',
        status: GoalStatus.ACTIVE,
      };

      const progress = calculateGoalProgress(goal, 80, WeightUnit.KG); // Current in kg
      expect(progress.current).toBeCloseTo(176, 0); // ~80 kg in lbs
    });
  });

  describe('estimateGoalCompletion', () => {
    it('returns today if goal is reached', () => {
      const goal: WeightGoal = {
        id: 'goal-1',
        user_id: 'user-1',
        goal_type: GoalType.WEIGHT_LOSS,
        target_weight: 75,
        target_weight_unit: WeightUnit.KG,
        target_date: '2025-06-01',
        start_weight: 85,
        start_date: '2025-01-01',
        status: GoalStatus.ACTIVE,
      };

      const estimate = estimateGoalCompletion(goal, 75, null);
      const today = new Date().toISOString().split('T')[0]!;
      expect(estimate).toBe(today);
    });

    it('estimates based on safe rates when no trend', () => {
      const goal: WeightGoal = {
        id: 'goal-1',
        user_id: 'user-1',
        goal_type: GoalType.WEIGHT_LOSS,
        target_weight: 75,
        target_weight_unit: WeightUnit.KG,
        target_date: '2025-06-01',
        start_weight: 85,
        start_date: '2025-01-01',
        status: GoalStatus.ACTIVE,
      };

      const estimate = estimateGoalCompletion(goal, 80, null);
      expect(estimate).not.toBeNull();

      // Should be 7-13 weeks from now (5 kg at 0.5-1 kg/week)
      const estimatedDate = new Date(estimate!);
      const today = new Date();
      const diffWeeks = (estimatedDate.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000);
      expect(diffWeeks).toBeGreaterThan(5);
      expect(diffWeeks).toBeLessThan(15);
    });

    it('uses trend data when available', () => {
      const goal: WeightGoal = {
        id: 'goal-1',
        user_id: 'user-1',
        goal_type: GoalType.WEIGHT_LOSS,
        target_weight: 75,
        target_weight_unit: WeightUnit.KG,
        target_date: '2025-06-01',
        start_weight: 85,
        start_date: '2025-01-01',
        status: GoalStatus.ACTIVE,
      };

      // Create a trend showing 2kg loss over 4 weeks (0.5 kg/week)
      const createLog = (weight: number, weeksAgo: number): WeightLog => {
        const date = new Date();
        date.setDate(date.getDate() - (weeksAgo * 7));
        return {
          id: `log-${weeksAgo}`,
          user_id: 'user-1',
          weight_value: weight,
          weight_unit: WeightUnit.KG,
          logged_at: date.toISOString().split('T')[0]!,
        };
      };

      const trend: WeightTrend = {
        entries: [
          createLog(82, 4),
          createLog(80, 0),
        ],
        average: 81,
        min: 80,
        max: 82,
        change: -2,
        changePercent: -2.4,
      };

      const estimate = estimateGoalCompletion(goal, 80, trend);
      expect(estimate).not.toBeNull();

      // 5 kg remaining at 0.5 kg/week = 10 weeks
      const estimatedDate = new Date(estimate!);
      const today = new Date();
      const diffWeeks = (estimatedDate.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000);
      expect(diffWeeks).toBeGreaterThan(8);
      expect(diffWeeks).toBeLessThan(12);
    });
  });

  describe('isOnTrack', () => {
    it('returns true for maintenance goal when near target', () => {
      const goal: WeightGoal = {
        id: 'goal-1',
        user_id: 'user-1',
        goal_type: GoalType.MAINTENANCE,
        target_weight: 80,
        target_weight_unit: WeightUnit.KG,
        target_date: null,
        start_weight: 80,
        start_date: '2025-01-01',
        status: GoalStatus.ACTIVE,
      };

      expect(isOnTrack(goal, 81, null)).toBe(true);
      expect(isOnTrack(goal, 79, null)).toBe(true);
      expect(isOnTrack(goal, 83, null)).toBe(false); // Too far
    });

    it('checks direction for weight loss without target date', () => {
      const goal: WeightGoal = {
        id: 'goal-1',
        user_id: 'user-1',
        goal_type: GoalType.WEIGHT_LOSS,
        target_weight: 75,
        target_weight_unit: WeightUnit.KG,
        target_date: null,
        start_weight: 85,
        start_date: '2025-01-01',
        status: GoalStatus.ACTIVE,
      };

      expect(isOnTrack(goal, 80, null)).toBe(true); // Lost weight
      expect(isOnTrack(goal, 90, null)).toBe(false); // Gained weight
    });

    it('checks direction for weight gain without target date', () => {
      const goal: WeightGoal = {
        id: 'goal-1',
        user_id: 'user-1',
        goal_type: GoalType.WEIGHT_GAIN,
        target_weight: 80,
        target_weight_unit: WeightUnit.KG,
        target_date: null,
        start_weight: 70,
        start_date: '2025-01-01',
        status: GoalStatus.ACTIVE,
      };

      expect(isOnTrack(goal, 75, null)).toBe(true); // Gained weight
      expect(isOnTrack(goal, 65, null)).toBe(false); // Lost weight
    });

    it('compares actual vs expected progress with target date', () => {
      // Goal started 30 days ago, target in 60 days (total 90 days)
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 60);

      const goal: WeightGoal = {
        id: 'goal-1',
        user_id: 'user-1',
        goal_type: GoalType.WEIGHT_LOSS,
        target_weight: 75,
        target_weight_unit: WeightUnit.KG,
        target_date: futureDate.toISOString().split('T')[0]!,
        start_weight: 84,
        start_date: pastDate.toISOString().split('T')[0]!,
        status: GoalStatus.ACTIVE,
      };

      // After 30/90 days, should have lost 3/9 kg
      // Expected: 81 kg
      expect(isOnTrack(goal, 81, null)).toBe(true);
      expect(isOnTrack(goal, 80, null)).toBe(true); // Ahead
      expect(isOnTrack(goal, 83, null)).toBe(false); // Behind
    });
  });

  describe('formatWeightChange', () => {
    it('formats positive change with + sign', () => {
      expect(formatWeightChange(2.5, WeightUnit.KG, 'en')).toBe('+2.5 kg');
      expect(formatWeightChange(5.3, WeightUnit.LBS, 'en')).toBe('+5.3 lbs');
    });

    it('formats negative change with - sign', () => {
      expect(formatWeightChange(-2.5, WeightUnit.KG, 'en')).toBe('-2.5 kg');
      expect(formatWeightChange(-5.3, WeightUnit.LBS, 'en')).toBe('-5.3 lbs');
    });

    it('formats zero change with + sign', () => {
      expect(formatWeightChange(0, WeightUnit.KG, 'en')).toBe('+0.0 kg');
    });

    it('formats for pt-BR locale with comma', () => {
      expect(formatWeightChange(2.5, WeightUnit.KG, 'pt-BR')).toBe('+2,5 kg');
      expect(formatWeightChange(-3.2, WeightUnit.KG, 'pt-BR')).toBe('-3,2 kg');
    });

    it('always shows 1 decimal place', () => {
      expect(formatWeightChange(2, WeightUnit.KG, 'en')).toBe('+2.0 kg');
      expect(formatWeightChange(-5, WeightUnit.LBS, 'en')).toBe('-5.0 lbs');
    });
  });
});
