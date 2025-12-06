import { describe, it, expect } from 'vitest';
import {
  calculateCaloriesFromMacros,
  convertToGrams,
  calculateNutritionForServing,
  formatNutritionLabel,
  validateFoodData,
  calculateCaloricDensity,
  isHighInMacro,
  getMacroSplit,
} from '../service';
import { FoodSource } from '../types';
import type { Food, FoodServingUnit } from '../types';

describe('Food Service', () => {
  // ============================================
  // CALORIE CALCULATIONS
  // ============================================

  describe('calculateCaloriesFromMacros', () => {
    it('calculates calories correctly for balanced macros', () => {
      // 20g protein (80 cal) + 30g carbs (120 cal) + 10g fat (90 cal) = 290 cal
      const calories = calculateCaloriesFromMacros(20, 30, 10);
      expect(calories).toBe(290);
    });

    it('calculates calories for high protein food', () => {
      // Chicken breast: 31g protein + 0g carbs + 3.6g fat
      // (31 × 4) + (0 × 4) + (3.6 × 9) = 124 + 0 + 32.4 = 156.4 ≈ 156
      const calories = calculateCaloriesFromMacros(31, 0, 3.6);
      expect(calories).toBe(156);
    });

    it('calculates calories for high carb food', () => {
      // White rice: 2.7g protein + 28g carbs + 0.3g fat
      // (2.7 × 4) + (28 × 4) + (0.3 × 9) = 10.8 + 112 + 2.7 = 125.5 ≈ 126
      const calories = calculateCaloriesFromMacros(2.7, 28, 0.3);
      expect(calories).toBe(126);
    });

    it('calculates calories for high fat food', () => {
      // Olive oil: 0g protein + 0g carbs + 100g fat
      // (0 × 4) + (0 × 4) + (100 × 9) = 900
      const calories = calculateCaloriesFromMacros(0, 0, 100);
      expect(calories).toBe(900);
    });

    it('handles zero macros', () => {
      const calories = calculateCaloriesFromMacros(0, 0, 0);
      expect(calories).toBe(0);
    });

    it('rounds to nearest integer', () => {
      // 10.1g protein + 10.1g carbs + 10.1g fat = 40.4 + 40.4 + 90.9 = 171.7 ≈ 172
      const calories = calculateCaloriesFromMacros(10.1, 10.1, 10.1);
      expect(calories).toBe(172);
    });
  });

  // ============================================
  // UNIT CONVERSIONS
  // ============================================

  describe('convertToGrams', () => {
    it('returns quantity unchanged for grams', () => {
      expect(convertToGrams(100, 'g', 1)).toBe(100);
      expect(convertToGrams(50.5, 'grams', 1)).toBe(50.5);
    });

    it('converts using grams equivalent', () => {
      // 1 cup = 240g
      expect(convertToGrams(1, 'cup', 240)).toBe(240);
      expect(convertToGrams(2, 'cup', 240)).toBe(480);
      expect(convertToGrams(0.5, 'cup', 240)).toBe(120);
    });

    it('converts tablespoon to grams', () => {
      // 1 tbsp = 15g
      expect(convertToGrams(2, 'tbsp', 15)).toBe(30);
    });

    it('converts teaspoon to grams', () => {
      // 1 tsp = 5g
      expect(convertToGrams(3, 'tsp', 5)).toBe(15);
    });

    it('handles decimal quantities', () => {
      // 1.5 cups × 240g = 360g
      expect(convertToGrams(1.5, 'cup', 240)).toBe(360);
    });

    it('rounds to one decimal place', () => {
      // 1.33 cups × 240g = 319.2g
      expect(convertToGrams(1.33, 'cup', 240)).toBe(319.2);
    });
  });

  // ============================================
  // NUTRITION CALCULATIONS
  // ============================================

  describe('calculateNutritionForServing', () => {
    const mockFood: Food = {
      id: '123',
      name: 'Chicken Breast',
      brand: null,
      protein_per_100g: 31,
      carbs_per_100g: 0,
      fat_per_100g: 3.6,
      fiber_per_100g: 0,
      sugar_per_100g: 0,
      sodium_mg_per_100g: 74,
      calories_per_100g: 165,
      source: FoodSource.USER,
      is_public: false,
      created_by: 'user-123',
    };

    it('calculates nutrition for 100g serving (no unit)', () => {
      const nutrition = calculateNutritionForServing(mockFood, 100);

      expect(nutrition.quantity).toBe(100);
      expect(nutrition.unit).toBe('g');
      expect(nutrition.grams).toBe(100);
      expect(nutrition.calories).toBe(156); // Calculated from macros
      expect(nutrition.protein_g).toBe(31);
      expect(nutrition.carbs_g).toBe(0);
      expect(nutrition.fat_g).toBe(3.6);
      expect(nutrition.sodium_mg).toBe(74);
    });

    it('calculates nutrition for 200g serving', () => {
      const nutrition = calculateNutritionForServing(mockFood, 200);

      expect(nutrition.grams).toBe(200);
      expect(nutrition.calories).toBe(313); // Calculated: (62 * 4) + (0 * 4) + (7.2 * 9) = 248 + 64.8 = 312.8 ≈ 313
      expect(nutrition.protein_g).toBe(62);
      expect(nutrition.fat_g).toBe(7.2);
    });

    it('calculates nutrition for 50g serving', () => {
      const nutrition = calculateNutritionForServing(mockFood, 50);

      expect(nutrition.grams).toBe(50);
      expect(nutrition.calories).toBe(78); // Half of 100g
      expect(nutrition.protein_g).toBe(15.5);
      expect(nutrition.fat_g).toBe(1.8);
    });

    it('calculates nutrition with serving unit', () => {
      const servingUnit: FoodServingUnit = {
        id: 'unit-1',
        food_id: '123',
        unit_name: 'cup',
        grams_equivalent: 140,
        is_default: true,
      };

      const nutrition = calculateNutritionForServing(mockFood, 1, servingUnit);

      expect(nutrition.quantity).toBe(1);
      expect(nutrition.unit).toBe('cup');
      expect(nutrition.grams).toBe(140);
      expect(nutrition.protein_g).toBe(43.4); // 31 × 1.4
      expect(nutrition.calories).toBe(219); // Calculated: (43.4 * 4) + (0 * 4) + (5 * 9) = 173.6 + 45 = 218.6 ≈ 219
    });

    it('handles foods with fiber and sugar', () => {
      const oatmeal: Food = {
        id: '456',
        name: 'Oatmeal',
        brand: null,
        protein_per_100g: 13.2,
        carbs_per_100g: 67.7,
        fat_per_100g: 6.9,
        fiber_per_100g: 10.6,
        sugar_per_100g: 0.9,
        sodium_mg_per_100g: 2,
        calories_per_100g: 389,
        source: FoodSource.USDA,
        is_public: true,
        created_by: null,
      };

      const nutrition = calculateNutritionForServing(oatmeal, 50);

      expect(nutrition.fiber_g).toBe(5.3);
      expect(nutrition.sugar_g).toBe(0.5);
    });

    it('rounds nutrition values to one decimal place', () => {
      const nutrition = calculateNutritionForServing(mockFood, 33);

      expect(nutrition.protein_g).toBe(10.2); // Should be rounded
      expect(nutrition.fat_g).toBe(1.2);
    });
  });

  // ============================================
  // NUTRITION LABEL FORMATTING
  // ============================================

  describe('formatNutritionLabel', () => {
    const mockFood: Food = {
      id: '123',
      name: 'Brown Rice',
      brand: 'Uncle Ben\'s',
      protein_per_100g: 2.7,
      carbs_per_100g: 23.5,
      fat_per_100g: 0.9,
      fiber_per_100g: 1.8,
      sugar_per_100g: 0.4,
      sodium_mg_per_100g: 5,
      calories_per_100g: 112,
      source: FoodSource.USER,
      is_public: false,
      created_by: 'user-123',
    };

    it('formats label in English with default 100g serving', () => {
      const label = formatNutritionLabel(mockFood, 'en');

      expect(label.food_name).toBe('Brown Rice');
      expect(label.brand).toBe('Uncle Ben\'s');
      expect(label.serving_size).toBe('100 g (100g)');
      expect(label.calories).toBe(113); // Calculated: (2.7 * 4) + (23.5 * 4) + (0.9 * 9) = 10.8 + 94 + 8.1 = 112.9 ≈ 113
      expect(label.locale).toBe('en');
      expect(label.labels.serving_size).toBe('Serving Size');
      expect(label.labels.calories).toBe('Calories');
      expect(label.labels.protein).toBe('Protein');
    });

    it('formats label in Portuguese', () => {
      const label = formatNutritionLabel(mockFood, 'pt-BR');

      expect(label.locale).toBe('pt-BR');
      expect(label.labels.serving_size).toBe('Porção');
      expect(label.labels.calories).toBe('Calorias');
      expect(label.labels.protein).toBe('Proteínas');
      expect(label.labels.total_fat).toBe('Gorduras Totais');
      expect(label.labels.total_carbs).toBe('Carboidratos Totais');
    });

    it('calculates daily value percentages correctly', () => {
      const label = formatNutritionLabel(mockFood, 'en');

      // Fat: 0.9g / 78g DV = 1.15% ≈ 1%
      expect(label.total_fat.daily_value).toBe('1%');

      // Sodium: 5mg / 2300mg DV = 0.22% ≈ 0%
      expect(label.sodium.daily_value).toBe('0%');

      // Carbs: 23.5g / 275g DV = 8.5% ≈ 9%
      expect(label.total_carbs.daily_value).toBe('9%');

      // Fiber: 1.8g / 28g DV = 6.4% ≈ 6%
      expect(label.dietary_fiber.daily_value).toBe('6%');
    });

    it('includes all required nutrient fields', () => {
      const label = formatNutritionLabel(mockFood, 'en');

      expect(label.total_fat).toHaveProperty('value');
      expect(label.total_fat).toHaveProperty('unit', 'g');
      expect(label.total_fat).toHaveProperty('daily_value');

      expect(label.sodium).toHaveProperty('value');
      expect(label.sodium).toHaveProperty('unit', 'mg');

      expect(label.total_carbs).toHaveProperty('value');
      expect(label.dietary_fiber).toHaveProperty('value');
      expect(label.total_sugars).toHaveProperty('value');
      expect(label.protein).toHaveProperty('value');
    });

    it('formats label with custom serving size', () => {
      const servingUnit: FoodServingUnit = {
        id: 'unit-1',
        food_id: '123',
        unit_name: 'cup',
        grams_equivalent: 195,
        is_default: true,
      };

      const customServing = calculateNutritionForServing(mockFood, 1, servingUnit);
      const label = formatNutritionLabel(mockFood, 'en', customServing);

      expect(label.serving_size).toBe('1 cup (195g)');
      expect(label.calories).toBe(221); // Scaled for 195g: (5.3 * 4) + (45.8 * 4) + (1.8 * 9) = 21.2 + 183.2 + 16.2 = 220.6 ≈ 221
    });

    it('protein does not have daily value', () => {
      const label = formatNutritionLabel(mockFood, 'en');

      expect(label.protein).toHaveProperty('value');
      expect(label.protein).toHaveProperty('unit', 'g');
      expect(label.protein).not.toHaveProperty('daily_value');
    });
  });

  // ============================================
  // VALIDATION
  // ============================================

  describe('validateFoodData', () => {
    const validData = {
      name: 'Banana',
      brand: null,
      protein_per_100g: 1.1,
      carbs_per_100g: 22.8,
      fat_per_100g: 0.3,
      fiber_per_100g: 2.6,
      sugar_per_100g: 12.2,
      sodium_mg_per_100g: 1,
      source: 'user' as const,
      is_public: false,
      created_by: '123e4567-e89b-12d3-a456-426614174000',
    };

    it('accepts valid food data', () => {
      const result = validateFoodData(validData);
      expect(result.success).toBe(true);
    });

    it('rejects negative protein', () => {
      const result = validateFoodData({ ...validData, protein_per_100g: -1 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some(e => e.path === 'protein_per_100g')).toBe(true);
      }
    });

    it('rejects negative carbs', () => {
      const result = validateFoodData({ ...validData, carbs_per_100g: -5 });
      expect(result.success).toBe(false);
    });

    it('rejects negative fat', () => {
      const result = validateFoodData({ ...validData, fat_per_100g: -2 });
      expect(result.success).toBe(false);
    });

    it('rejects fiber greater than carbs', () => {
      const result = validateFoodData({
        ...validData,
        carbs_per_100g: 10,
        fiber_per_100g: 15,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some(e => e.message.includes('Fiber'))).toBe(true);
      }
    });

    it('rejects sugar greater than carbs', () => {
      const result = validateFoodData({
        ...validData,
        carbs_per_100g: 10,
        sugar_per_100g: 20,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some(e => e.message.includes('Sugar'))).toBe(true);
      }
    });

    it('rejects empty food name', () => {
      const result = validateFoodData({ ...validData, name: '' });
      expect(result.success).toBe(false);
    });

    it('rejects macros over 100g per 100g', () => {
      const result = validateFoodData({ ...validData, protein_per_100g: 150 });
      expect(result.success).toBe(false);
    });

    it('accepts valid update data (partial)', () => {
      const result = validateFoodData({ name: 'Updated Name' }, true);
      expect(result.success).toBe(true);
    });

    it('accepts fiber equal to carbs', () => {
      const result = validateFoodData({
        ...validData,
        carbs_per_100g: 10,
        fiber_per_100g: 10,
        sugar_per_100g: 0, // Reset sugar since we're changing carbs
      });
      expect(result.success).toBe(true);
    });

    it('sets default values for optional fields', () => {
      const minimalData = {
        name: 'Test Food',
        protein_per_100g: 10,
        carbs_per_100g: 20,
        fat_per_100g: 5,
        created_by: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = validateFoodData(minimalData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fiber_per_100g).toBe(0);
        expect(result.data.sugar_per_100g).toBe(0);
        expect(result.data.sodium_mg_per_100g).toBe(0);
        expect(result.data.source).toBe('user');
        expect(result.data.is_public).toBe(false);
      }
    });
  });

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  describe('calculateCaloricDensity', () => {
    it('calculates caloric density correctly', () => {
      const food: Food = {
        id: '1',
        name: 'Test',
        brand: null,
        protein_per_100g: 0,
        carbs_per_100g: 0,
        fat_per_100g: 0,
        fiber_per_100g: 0,
        sugar_per_100g: 0,
        sodium_mg_per_100g: 0,
        calories_per_100g: 200,
        source: FoodSource.USER,
        is_public: false,
        created_by: null,
      };

      expect(calculateCaloricDensity(food)).toBe(2); // 200 cal / 100g = 2 cal/g
    });

    it('handles zero calories', () => {
      const food: Food = {
        id: '1',
        name: 'Water',
        brand: null,
        protein_per_100g: 0,
        carbs_per_100g: 0,
        fat_per_100g: 0,
        fiber_per_100g: 0,
        sugar_per_100g: 0,
        sodium_mg_per_100g: 0,
        calories_per_100g: 0,
        source: FoodSource.USER,
        is_public: false,
        created_by: null,
      };

      expect(calculateCaloricDensity(food)).toBe(0);
    });
  });

  describe('isHighInMacro', () => {
    const highProteinFood: Food = {
      id: '1',
      name: 'Chicken',
      brand: null,
      protein_per_100g: 31,
      carbs_per_100g: 0,
      fat_per_100g: 3.6,
      fiber_per_100g: 0,
      sugar_per_100g: 0,
      sodium_mg_per_100g: 0,
      calories_per_100g: 165,
      source: FoodSource.USER,
      is_public: false,
      created_by: null,
    };

    const highCarbFood: Food = {
      id: '2',
      name: 'Pasta',
      brand: null,
      protein_per_100g: 5,
      carbs_per_100g: 75,
      fat_per_100g: 1,
      fiber_per_100g: 3,
      sugar_per_100g: 2,
      sodium_mg_per_100g: 0,
      calories_per_100g: 371,
      source: FoodSource.USER,
      is_public: false,
      created_by: null,
    };

    const highFatFood: Food = {
      id: '3',
      name: 'Almonds',
      brand: null,
      protein_per_100g: 21,
      carbs_per_100g: 22,
      fat_per_100g: 50,
      fiber_per_100g: 12,
      sugar_per_100g: 4,
      sodium_mg_per_100g: 0,
      calories_per_100g: 579,
      source: FoodSource.USER,
      is_public: false,
      created_by: null,
    };

    it('identifies high protein food', () => {
      expect(isHighInMacro(highProteinFood, 'protein')).toBe(true);
      expect(isHighInMacro(highProteinFood, 'carbs')).toBe(false);
      expect(isHighInMacro(highProteinFood, 'fat')).toBe(false);
    });

    it('identifies high carb food', () => {
      expect(isHighInMacro(highCarbFood, 'protein')).toBe(false);
      expect(isHighInMacro(highCarbFood, 'carbs')).toBe(true);
      expect(isHighInMacro(highCarbFood, 'fat')).toBe(false);
    });

    it('identifies high fat food', () => {
      expect(isHighInMacro(highFatFood, 'protein')).toBe(true);
      expect(isHighInMacro(highFatFood, 'carbs')).toBe(false);
      expect(isHighInMacro(highFatFood, 'fat')).toBe(true);
    });
  });

  describe('getMacroSplit', () => {
    it('calculates macro split for balanced food', () => {
      const food: Food = {
        id: '1',
        name: 'Balanced Meal',
        brand: null,
        protein_per_100g: 25, // 100 cal
        carbs_per_100g: 25,   // 100 cal
        fat_per_100g: 11.1,   // 100 cal
        fiber_per_100g: 0,
        sugar_per_100g: 0,
        sodium_mg_per_100g: 0,
        calories_per_100g: 300,
        source: FoodSource.USER,
        is_public: false,
        created_by: null,
      };

      const split = getMacroSplit(food);
      expect(split.protein_percent).toBe(33); // ~33%
      expect(split.carbs_percent).toBe(33);   // ~33%
      expect(split.fat_percent).toBe(33);     // ~33%
    });

    it('calculates macro split for high carb food', () => {
      const rice: Food = {
        id: '2',
        name: 'Rice',
        brand: null,
        protein_per_100g: 2.7,  // 10.8 cal
        carbs_per_100g: 28,     // 112 cal
        fat_per_100g: 0.3,      // 2.7 cal
        fiber_per_100g: 0,
        sugar_per_100g: 0,
        sodium_mg_per_100g: 0,
        calories_per_100g: 130,
        source: FoodSource.USER,
        is_public: false,
        created_by: null,
      };

      const split = getMacroSplit(rice);
      expect(split.carbs_percent).toBeGreaterThan(80); // Majority carbs
      expect(split.protein_percent).toBeLessThan(15);
      expect(split.fat_percent).toBeLessThan(10);
    });

    it('handles zero calorie food', () => {
      const water: Food = {
        id: '3',
        name: 'Water',
        brand: null,
        protein_per_100g: 0,
        carbs_per_100g: 0,
        fat_per_100g: 0,
        fiber_per_100g: 0,
        sugar_per_100g: 0,
        sodium_mg_per_100g: 0,
        calories_per_100g: 0,
        source: FoodSource.USER,
        is_public: false,
        created_by: null,
      };

      const split = getMacroSplit(water);
      expect(split.protein_percent).toBe(0);
      expect(split.carbs_percent).toBe(0);
      expect(split.fat_percent).toBe(0);
    });

    it('percentages sum to approximately 100', () => {
      const food: Food = {
        id: '1',
        name: 'Test',
        brand: null,
        protein_per_100g: 20,
        carbs_per_100g: 30,
        fat_per_100g: 10,
        fiber_per_100g: 0,
        sugar_per_100g: 0,
        sodium_mg_per_100g: 0,
        calories_per_100g: 290,
        source: FoodSource.USER,
        is_public: false,
        created_by: null,
      };

      const split = getMacroSplit(food);
      const sum = split.protein_percent + split.carbs_percent + split.fat_percent;
      // Allow for rounding differences
      expect(sum).toBeGreaterThanOrEqual(98);
      expect(sum).toBeLessThanOrEqual(102);
    });
  });
});
