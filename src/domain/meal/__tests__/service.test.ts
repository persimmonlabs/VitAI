import { describe, it, expect } from 'vitest';
import {
  calculateMealTotals,
  calculateDailySummary,
  getMealTypeForTime,
  groupMealsByType,
  formatMealTime,
  getMealTypeDisplayName,
  formatMealDate,
  getDayBoundaries,
  validateNutritionalValues,
} from '../service';
import { MealType } from '../types';
import type { MealItem, MealWithItems } from '../types';

describe('Meal Service', () => {
  describe('calculateMealTotals', () => {
    it('calculates totals for empty items', () => {
      const totals = calculateMealTotals([]);
      expect(totals).toEqual({
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
      });
    });

    it('calculates totals for single item', () => {
      const items: MealItem[] = [
        {
          id: '1',
          meal_id: 'meal-1',
          food_id: 'food-1',
          quantity: 100,
          unit: 'g',
          calories: 200,
          protein: 20,
          carbs: 10,
          fat: 8,
        },
      ];

      const totals = calculateMealTotals(items);
      expect(totals).toEqual({
        total_calories: 200,
        total_protein: 20,
        total_carbs: 10,
        total_fat: 8,
      });
    });

    it('calculates totals for multiple items', () => {
      const items: MealItem[] = [
        {
          id: '1',
          meal_id: 'meal-1',
          food_id: 'food-1',
          quantity: 100,
          unit: 'g',
          calories: 200,
          protein: 20,
          carbs: 10,
          fat: 8,
        },
        {
          id: '2',
          meal_id: 'meal-1',
          food_id: 'food-2',
          quantity: 50,
          unit: 'g',
          calories: 150,
          protein: 5,
          carbs: 30,
          fat: 2,
        },
      ];

      const totals = calculateMealTotals(items);
      expect(totals).toEqual({
        total_calories: 350,
        total_protein: 25,
        total_carbs: 40,
        total_fat: 10,
      });
    });

    it('handles decimal values', () => {
      const items: MealItem[] = [
        {
          id: '1',
          meal_id: 'meal-1',
          food_id: 'food-1',
          quantity: 100,
          unit: 'g',
          calories: 123.5,
          protein: 12.3,
          carbs: 8.7,
          fat: 4.2,
        },
      ];

      const totals = calculateMealTotals(items);
      expect(totals.total_calories).toBe(123.5);
      expect(totals.total_protein).toBe(12.3);
    });
  });

  describe('calculateDailySummary', () => {
    const createMealWithItems = (
      calories: number,
      protein: number,
      carbs: number,
      fat: number
    ): MealWithItems => ({
      id: 'meal-1',
      user_id: 'user-1',
      meal_type: MealType.BREAKFAST,
      logged_at: new Date().toISOString(),
      notes: null,
      total_calories: calories,
      total_protein: protein,
      total_carbs: carbs,
      total_fat: fat,
      items: [],
    });

    it('calculates summary for empty meals', () => {
      const summary = calculateDailySummary([], 2000, '2024-01-15');
      expect(summary).toEqual({
        date: '2024-01-15',
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
        meal_count: 0,
        calorie_target: 2000,
        calorie_remaining: 2000,
      });
    });

    it('calculates summary for single meal', () => {
      const meals = [createMealWithItems(500, 30, 40, 20)];
      const summary = calculateDailySummary(meals, 2000, '2024-01-15');

      expect(summary.total_calories).toBe(500);
      expect(summary.total_protein).toBe(30);
      expect(summary.total_carbs).toBe(40);
      expect(summary.total_fat).toBe(20);
      expect(summary.meal_count).toBe(1);
      expect(summary.calorie_remaining).toBe(1500);
    });

    it('calculates summary for multiple meals', () => {
      const meals = [
        createMealWithItems(500, 30, 40, 20),
        createMealWithItems(600, 35, 50, 22),
        createMealWithItems(400, 20, 30, 18),
      ];
      const summary = calculateDailySummary(meals, 2000, '2024-01-15');

      expect(summary.total_calories).toBe(1500);
      expect(summary.total_protein).toBe(85);
      expect(summary.total_carbs).toBe(120);
      expect(summary.total_fat).toBe(60);
      expect(summary.meal_count).toBe(3);
      expect(summary.calorie_remaining).toBe(500);
    });

    it('handles null calorie target', () => {
      const meals = [createMealWithItems(500, 30, 40, 20)];
      const summary = calculateDailySummary(meals, null, '2024-01-15');

      expect(summary.calorie_target).toBeNull();
      expect(summary.calorie_remaining).toBeNull();
    });

    it('rounds totals correctly', () => {
      const meals = [createMealWithItems(123.7, 12.34, 8.76, 4.29)];
      const summary = calculateDailySummary(meals, 2000, '2024-01-15');

      expect(summary.total_calories).toBe(124);
      expect(summary.total_protein).toBe(12.3);
      expect(summary.total_carbs).toBe(8.8);
      expect(summary.total_fat).toBe(4.3);
    });
  });

  describe('getMealTypeForTime', () => {
    it('returns BREAKFAST for morning times (5-11)', () => {
      const morning = new Date('2024-01-15T07:30:00');
      expect(getMealTypeForTime(morning)).toBe(MealType.BREAKFAST);

      const earlyMorning = new Date('2024-01-15T05:00:00');
      expect(getMealTypeForTime(earlyMorning)).toBe(MealType.BREAKFAST);
    });

    it('returns LUNCH for midday times (11-15)', () => {
      const lunch = new Date('2024-01-15T12:30:00');
      expect(getMealTypeForTime(lunch)).toBe(MealType.LUNCH);

      const lateLunch = new Date('2024-01-15T14:45:00');
      expect(getMealTypeForTime(lateLunch)).toBe(MealType.LUNCH);
    });

    it('returns DINNER for evening times (15-20)', () => {
      const dinner = new Date('2024-01-15T18:00:00');
      expect(getMealTypeForTime(dinner)).toBe(MealType.DINNER);

      const earlyDinner = new Date('2024-01-15T15:30:00');
      expect(getMealTypeForTime(earlyDinner)).toBe(MealType.DINNER);
    });

    it('returns SNACK for late night and early morning', () => {
      const lateNight = new Date('2024-01-15T22:00:00');
      expect(getMealTypeForTime(lateNight)).toBe(MealType.SNACK);

      const veryEarly = new Date('2024-01-15T03:00:00');
      expect(getMealTypeForTime(veryEarly)).toBe(MealType.SNACK);
    });

    it('handles boundary times correctly', () => {
      expect(getMealTypeForTime(new Date('2024-01-15T11:00:00'))).toBe(MealType.LUNCH);
      expect(getMealTypeForTime(new Date('2024-01-15T15:00:00'))).toBe(MealType.DINNER);
      expect(getMealTypeForTime(new Date('2024-01-15T20:00:00'))).toBe(MealType.SNACK);
    });
  });

  describe('groupMealsByType', () => {
    const createMeal = (type: typeof MealType[keyof typeof MealType] | null): MealWithItems => ({
      id: `meal-${type}`,
      user_id: 'user-1',
      meal_type: type,
      logged_at: new Date().toISOString(),
      notes: null,
      total_calories: 500,
      total_protein: 30,
      total_carbs: 40,
      total_fat: 20,
      items: [],
    });

    it('groups empty meals', () => {
      const grouped = groupMealsByType([]);
      expect(grouped.breakfast).toEqual([]);
      expect(grouped.lunch).toEqual([]);
      expect(grouped.dinner).toEqual([]);
      expect(grouped.snack).toEqual([]);
      expect(grouped.pre_workout).toEqual([]);
      expect(grouped.post_workout).toEqual([]);
      expect(grouped.untyped).toEqual([]);
    });

    it('groups meals by type', () => {
      const meals = [
        createMeal(MealType.BREAKFAST),
        createMeal(MealType.LUNCH),
        createMeal(MealType.BREAKFAST),
        createMeal(MealType.SNACK),
      ];

      const grouped = groupMealsByType(meals);
      expect(grouped.breakfast).toHaveLength(2);
      expect(grouped.lunch).toHaveLength(1);
      expect(grouped.snack).toHaveLength(1);
      expect(grouped.dinner).toHaveLength(0);
    });

    it('handles untyped meals', () => {
      const meals = [
        createMeal(null),
        createMeal(MealType.BREAKFAST),
        createMeal(null),
      ];

      const grouped = groupMealsByType(meals);
      expect(grouped.untyped).toHaveLength(2);
      expect(grouped.breakfast).toHaveLength(1);
    });

    it('handles workout meals', () => {
      const meals = [
        createMeal(MealType.PRE_WORKOUT),
        createMeal(MealType.POST_WORKOUT),
      ];

      const grouped = groupMealsByType(meals);
      expect(grouped.pre_workout).toHaveLength(1);
      expect(grouped.post_workout).toHaveLength(1);
    });
  });

  describe('formatMealTime', () => {
    const testDate = new Date('2024-01-15T14:30:00');

    it('formats time in English (12-hour)', () => {
      const formatted = formatMealTime(testDate, 'en');
      expect(formatted).toMatch(/2:30/);
      expect(formatted).toMatch(/PM/i);
    });

    it('formats time in Portuguese (24-hour)', () => {
      const formatted = formatMealTime(testDate, 'pt-BR');
      expect(formatted).toContain('14:30');
    });

    it('defaults to English', () => {
      const formatted = formatMealTime(testDate);
      expect(formatted).toMatch(/PM/i);
    });
  });

  describe('getMealTypeDisplayName', () => {
    it('returns English names', () => {
      expect(getMealTypeDisplayName(MealType.BREAKFAST, 'en')).toBe('Breakfast');
      expect(getMealTypeDisplayName(MealType.LUNCH, 'en')).toBe('Lunch');
      expect(getMealTypeDisplayName(MealType.DINNER, 'en')).toBe('Dinner');
      expect(getMealTypeDisplayName(MealType.SNACK, 'en')).toBe('Snack');
      expect(getMealTypeDisplayName(MealType.PRE_WORKOUT, 'en')).toBe('Pre-Workout');
      expect(getMealTypeDisplayName(MealType.POST_WORKOUT, 'en')).toBe('Post-Workout');
    });

    it('returns Portuguese names', () => {
      expect(getMealTypeDisplayName(MealType.BREAKFAST, 'pt-BR')).toBe('Café da Manhã');
      expect(getMealTypeDisplayName(MealType.LUNCH, 'pt-BR')).toBe('Almoço');
      expect(getMealTypeDisplayName(MealType.DINNER, 'pt-BR')).toBe('Jantar');
      expect(getMealTypeDisplayName(MealType.SNACK, 'pt-BR')).toBe('Lanche');
      expect(getMealTypeDisplayName(MealType.PRE_WORKOUT, 'pt-BR')).toBe('Pré-Treino');
      expect(getMealTypeDisplayName(MealType.POST_WORKOUT, 'pt-BR')).toBe('Pós-Treino');
    });

    it('handles null meal type', () => {
      expect(getMealTypeDisplayName(null, 'en')).toBe('Untyped Meal');
      expect(getMealTypeDisplayName(null, 'pt-BR')).toBe('Refeição Sem Tipo');
    });

    it('defaults to English', () => {
      expect(getMealTypeDisplayName(MealType.BREAKFAST)).toBe('Breakfast');
    });
  });

  describe('formatMealDate', () => {
    it('formats date as YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T14:30:00Z');
      expect(formatMealDate(date)).toBe('2024-01-15');
    });

    it('handles different dates', () => {
      const date1 = new Date('2024-12-31T12:00:00Z');
      const date2 = new Date('2024-01-01T12:00:00Z');
      expect(formatMealDate(date1)).toBe('2024-12-31');
      expect(formatMealDate(date2)).toBe('2024-01-01');
    });
  });

  describe('getDayBoundaries', () => {
    it('returns start and end of day', () => {
      const date = new Date(2024, 0, 15, 14, 30, 0);
      const boundaries = getDayBoundaries(date);

      const startDate = new Date(boundaries.start);
      const endDate = new Date(boundaries.end);

      expect(startDate.getFullYear()).toBe(2024);
      expect(startDate.getMonth()).toBe(0);
      expect(startDate.getDate()).toBe(15);
      expect(startDate.getHours()).toBe(0);
      expect(startDate.getMinutes()).toBe(0);
      expect(startDate.getSeconds()).toBe(0);

      expect(endDate.getFullYear()).toBe(2024);
      expect(endDate.getMonth()).toBe(0);
      expect(endDate.getDate()).toBe(15);
      expect(endDate.getHours()).toBe(23);
      expect(endDate.getMinutes()).toBe(59);
      expect(endDate.getSeconds()).toBe(59);
    });

    it('handles different dates', () => {
      const date = new Date(2024, 11, 25, 12, 0, 0);
      const boundaries = getDayBoundaries(date);

      const startDate = new Date(boundaries.start);
      const endDate = new Date(boundaries.end);

      expect(startDate.getDate()).toBe(25);
      expect(startDate.getMonth()).toBe(11);
      expect(endDate.getDate()).toBe(25);
      expect(endDate.getMonth()).toBe(11);
    });

    it('returns ISO format strings', () => {
      const date = new Date(2024, 0, 15);
      const boundaries = getDayBoundaries(date);

      expect(() => new Date(boundaries.start)).not.toThrow();
      expect(() => new Date(boundaries.end)).not.toThrow();
    });
  });

  describe('validateNutritionalValues', () => {
    it('validates correct nutritional values', () => {
      const result = validateNutritionalValues({
        calories: 200,
        protein: 20,  // 80 cal
        carbs: 20,    // 80 cal
        fat: 4,       // 36 cal
        // Total: 196 cal (within 15% of 200)
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects values with mismatched calories', () => {
      const result = validateNutritionalValues({
        calories: 100,
        protein: 20,  // 80 cal
        carbs: 20,    // 80 cal
        fat: 10,      // 90 cal
        // Total: 250 cal (way over 100)
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Calorie count does not match macronutrient breakdown');
    });

    it('rejects negative values', () => {
      const result = validateNutritionalValues({
        calories: -10,
        protein: -5,
        carbs: 20,
        fat: 5,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Calories cannot be negative');
      expect(result.errors).toContain('Protein cannot be negative');
    });

    it('rejects unreasonably high values', () => {
      const result = validateNutritionalValues({
        calories: 1500,
        protein: 150,
        carbs: 150,
        fat: 150,
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('allows values within 15% tolerance', () => {
      const result = validateNutritionalValues({
        calories: 200,
        protein: 15,  // 60 cal
        carbs: 25,    // 100 cal
        fat: 5,       // 45 cal
        // Total: 205 cal (2.5% difference)
      });

      expect(result.valid).toBe(true);
    });

    it('validates zero values', () => {
      const result = validateNutritionalValues({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
