import { describe, it, expect } from 'vitest';
import {
  calculateBMR,
  calculateTDEE,
  suggestCalorieTarget,
  calculateMacroTargets,
  convertWeight,
  convertHeight,
  feetInchesToCm,
  cmToFeetInches,
  validateOnboardingData,
  calculateWeightDelta,
  estimateWeeksToGoal,
} from '../service';
import { ActivityLevel, Sex, GoalType } from '../types';

describe('User Service', () => {
  describe('calculateBMR', () => {
    it('calculates BMR correctly for males', () => {
      // Example: 80kg, 180cm, 30 years old male
      // BMR = (10 × 80) + (6.25 × 180) - (5 × 30) + 5 = 800 + 1125 - 150 + 5 = 1780
      const bmr = calculateBMR({
        weight_kg: 80,
        height_cm: 180,
        age: 30,
        sex: Sex.MALE,
      });
      expect(bmr).toBe(1780);
    });

    it('calculates BMR correctly for females', () => {
      // Example: 60kg, 165cm, 25 years old female
      // BMR = (10 × 60) + (6.25 × 165) - (5 × 25) - 161 = 600 + 1031.25 - 125 - 161 = 1345
      const bmr = calculateBMR({
        weight_kg: 60,
        height_cm: 165,
        age: 25,
        sex: Sex.FEMALE,
      });
      expect(bmr).toBe(1345);
    });

    it('handles edge cases - young person', () => {
      const bmr = calculateBMR({
        weight_kg: 50,
        height_cm: 160,
        age: 13,
        sex: Sex.MALE,
      });
      expect(bmr).toBeGreaterThan(0);
      expect(bmr).toBeLessThan(2000);
    });

    it('handles edge cases - elderly person', () => {
      const bmr = calculateBMR({
        weight_kg: 70,
        height_cm: 170,
        age: 80,
        sex: Sex.FEMALE,
      });
      expect(bmr).toBeGreaterThan(0);
      expect(bmr).toBeLessThan(1500);
    });
  });

  describe('calculateTDEE', () => {
    const baseInput = {
      weight_kg: 80,
      height_cm: 180,
      age: 30,
      sex: Sex.MALE,
    };

    it('applies sedentary multiplier (1.2)', () => {
      const tdee = calculateTDEE({ ...baseInput, activity_level: ActivityLevel.SEDENTARY });
      const bmr = calculateBMR(baseInput);
      expect(tdee).toBe(Math.round(bmr * 1.2));
    });

    it('applies light multiplier (1.375)', () => {
      const tdee = calculateTDEE({ ...baseInput, activity_level: ActivityLevel.LIGHT });
      const bmr = calculateBMR(baseInput);
      expect(tdee).toBe(Math.round(bmr * 1.375));
    });

    it('applies moderate multiplier (1.55)', () => {
      const tdee = calculateTDEE({ ...baseInput, activity_level: ActivityLevel.MODERATE });
      const bmr = calculateBMR(baseInput);
      expect(tdee).toBe(Math.round(bmr * 1.55));
    });

    it('applies active multiplier (1.725)', () => {
      const tdee = calculateTDEE({ ...baseInput, activity_level: ActivityLevel.ACTIVE });
      const bmr = calculateBMR(baseInput);
      expect(tdee).toBe(Math.round(bmr * 1.725));
    });

    it('applies very active multiplier (1.9)', () => {
      const tdee = calculateTDEE({ ...baseInput, activity_level: ActivityLevel.VERY_ACTIVE });
      const bmr = calculateBMR(baseInput);
      expect(tdee).toBe(Math.round(bmr * 1.9));
    });
  });

  describe('suggestCalorieTarget', () => {
    const baseInput = {
      weight_kg: 80,
      height_cm: 180,
      age: 30,
      sex: Sex.MALE,
      activity_level: ActivityLevel.MODERATE,
    };

    it('returns TDEE for maintenance', () => {
      const target = suggestCalorieTarget({ ...baseInput, goal_type: GoalType.MAINTENANCE });
      const tdee = calculateTDEE(baseInput);
      expect(target).toBe(tdee);
    });

    it('returns TDEE - 500 for weight loss', () => {
      const target = suggestCalorieTarget({ ...baseInput, goal_type: GoalType.WEIGHT_LOSS });
      const tdee = calculateTDEE(baseInput);
      expect(target).toBe(tdee - 500);
    });

    it('returns TDEE + 300 for weight gain', () => {
      const target = suggestCalorieTarget({ ...baseInput, goal_type: GoalType.WEIGHT_GAIN });
      const tdee = calculateTDEE(baseInput);
      expect(target).toBe(tdee + 300);
    });

    it('enforces minimum of 1200 calories for weight loss', () => {
      const target = suggestCalorieTarget({
        weight_kg: 40,
        height_cm: 150,
        age: 60,
        sex: Sex.FEMALE,
        activity_level: ActivityLevel.SEDENTARY,
        goal_type: GoalType.WEIGHT_LOSS,
      });
      expect(target).toBeGreaterThanOrEqual(1200);
    });
  });

  describe('calculateMacroTargets', () => {
    it('calculates correct macro split for 2000 calories', () => {
      const macros = calculateMacroTargets(2000);
      // 30% protein (4 cal/g) = 600 cal = 150g
      // 40% carbs (4 cal/g) = 800 cal = 200g
      // 30% fat (9 cal/g) = 600 cal = 67g
      expect(macros.protein_g).toBe(150);
      expect(macros.carbs_g).toBe(200);
      expect(macros.fat_g).toBe(67);
    });

    it('rounds to whole numbers', () => {
      const macros = calculateMacroTargets(1750);
      expect(Number.isInteger(macros.protein_g)).toBe(true);
      expect(Number.isInteger(macros.carbs_g)).toBe(true);
      expect(Number.isInteger(macros.fat_g)).toBe(true);
    });
  });

  describe('convertWeight', () => {
    it('converts kg to lbs correctly', () => {
      expect(convertWeight(1, 'kg', 'lbs')).toBe(2.2);
      expect(convertWeight(10, 'kg', 'lbs')).toBe(22);
      expect(convertWeight(80, 'kg', 'lbs')).toBe(176.4);
    });

    it('converts lbs to kg correctly', () => {
      expect(convertWeight(2.2, 'lbs', 'kg')).toBe(1);
      expect(convertWeight(100, 'lbs', 'kg')).toBe(45.4);
      expect(convertWeight(176, 'lbs', 'kg')).toBe(79.8);
    });

    it('returns same value when units match', () => {
      expect(convertWeight(80, 'kg', 'kg')).toBe(80);
      expect(convertWeight(176, 'lbs', 'lbs')).toBe(176);
    });
  });

  describe('convertHeight', () => {
    it('converts cm to inches correctly', () => {
      expect(convertHeight(100, 'cm', 'in')).toBe(39.4);
      expect(convertHeight(180, 'cm', 'in')).toBe(70.9);
    });

    it('converts inches to cm correctly', () => {
      expect(convertHeight(39.4, 'in', 'cm')).toBe(100.1);
      expect(convertHeight(72, 'in', 'cm')).toBe(182.9);
    });

    it('returns same value when units match', () => {
      expect(convertHeight(180, 'cm', 'cm')).toBe(180);
      expect(convertHeight(72, 'in', 'in')).toBe(72);
    });
  });

  describe('feetInchesToCm', () => {
    it('converts feet and inches to cm', () => {
      expect(feetInchesToCm(5, 10)).toBe(177.8); // 5'10" = 177.8 cm
      expect(feetInchesToCm(6, 0)).toBe(182.9);  // 6'0" = 182.9 cm
      expect(feetInchesToCm(5, 0)).toBe(152.4);  // 5'0" = 152.4 cm
    });
  });

  describe('cmToFeetInches', () => {
    it('converts cm to feet and inches', () => {
      const result1 = cmToFeetInches(180);
      expect(result1.feet).toBe(5);
      expect(result1.inches).toBe(11);

      const result2 = cmToFeetInches(152);
      expect(result2.feet).toBe(4);
      expect(result2.inches).toBe(12); // rounds up
    });
  });

  describe('validateOnboardingData', () => {
    const validData = {
      name: 'John Doe',
      age: 30,
      sex: 'male',
      height_cm: 180,
      weight_kg: 80,
      activity_level: 'moderate',
      unit_system: 'metric',
      language: 'en',
      timezone: 'UTC',
    };

    it('accepts valid onboarding data', () => {
      const result = validateOnboardingData(validData);
      expect(result.success).toBe(true);
    });

    it('rejects age below 13', () => {
      const result = validateOnboardingData({ ...validData, age: 10 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some(e => e.path === 'age')).toBe(true);
      }
    });

    it('rejects age above 120', () => {
      const result = validateOnboardingData({ ...validData, age: 150 });
      expect(result.success).toBe(false);
    });

    it('rejects negative height', () => {
      const result = validateOnboardingData({ ...validData, height_cm: -10 });
      expect(result.success).toBe(false);
    });

    it('rejects negative weight', () => {
      const result = validateOnboardingData({ ...validData, weight_kg: -10 });
      expect(result.success).toBe(false);
    });

    it('rejects empty name', () => {
      const result = validateOnboardingData({ ...validData, name: '' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid sex', () => {
      const result = validateOnboardingData({ ...validData, sex: 'other' });
      expect(result.success).toBe(false);
    });

    it('accepts optional goal fields', () => {
      const result = validateOnboardingData({
        ...validData,
        goal_type: 'weight_loss',
        target_weight_kg: 75,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('calculateWeightDelta', () => {
    it('calculates weight loss correctly', () => {
      const result = calculateWeightDelta(80, 75);
      expect(result.delta).toBe(5);
      expect(result.direction).toBe('lose');
    });

    it('calculates weight gain correctly', () => {
      const result = calculateWeightDelta(70, 80);
      expect(result.delta).toBe(10);
      expect(result.direction).toBe('gain');
    });

    it('returns maintain for small differences', () => {
      const result = calculateWeightDelta(80, 80.3);
      expect(result.direction).toBe('maintain');
    });
  });

  describe('estimateWeeksToGoal', () => {
    it('estimates weight loss duration correctly', () => {
      const result = estimateWeeksToGoal(80, 75, GoalType.WEIGHT_LOSS);
      // 5kg to lose: 5-10 weeks at 0.5-1 kg/week
      expect(result.minWeeks).toBe(5);
      expect(result.maxWeeks).toBe(10);
    });

    it('estimates weight gain duration correctly', () => {
      const result = estimateWeeksToGoal(70, 75, GoalType.WEIGHT_GAIN);
      // 5kg to gain: 10-20 weeks at 0.25-0.5 kg/week
      expect(result.minWeeks).toBe(10);
      expect(result.maxWeeks).toBe(20);
    });

    it('returns 0 for maintenance', () => {
      const result = estimateWeeksToGoal(80, 80, GoalType.MAINTENANCE);
      expect(result.minWeeks).toBe(0);
      expect(result.maxWeeks).toBe(0);
    });
  });
});
