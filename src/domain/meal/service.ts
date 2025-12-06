import {
  type MealItem,
  type NutritionalTotals,
  type MealWithItems,
  type DailySummary,
  type MealsByType,
  type MealType,
  MealType as MealTypeEnum,
} from './types';

// ============================================
// MEAL CALCULATIONS
// ============================================

/**
 * Calculate total nutritional values from meal items
 */
export function calculateMealTotals(items: MealItem[]): NutritionalTotals {
  return items.reduce(
    (totals, item) => ({
      total_calories: totals.total_calories + item.calories,
      total_protein: totals.total_protein + item.protein,
      total_carbs: totals.total_carbs + item.carbs,
      total_fat: totals.total_fat + item.fat,
    }),
    {
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fat: 0,
    }
  );
}

/**
 * Calculate daily summary from meals
 */
export function calculateDailySummary(
  meals: MealWithItems[],
  calorieTarget: number | null,
  date: string
): DailySummary {
  const totals = meals.reduce(
    (acc, meal) => ({
      total_calories: acc.total_calories + meal.total_calories,
      total_protein: acc.total_protein + meal.total_protein,
      total_carbs: acc.total_carbs + meal.total_carbs,
      total_fat: acc.total_fat + meal.total_fat,
    }),
    {
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fat: 0,
    }
  );

  const calorieRemaining = calorieTarget !== null
    ? calorieTarget - totals.total_calories
    : null;

  return {
    date,
    total_calories: Math.round(totals.total_calories),
    total_protein: Math.round(totals.total_protein * 10) / 10,
    total_carbs: Math.round(totals.total_carbs * 10) / 10,
    total_fat: Math.round(totals.total_fat * 10) / 10,
    meal_count: meals.length,
    calorie_target: calorieTarget,
    calorie_remaining: calorieRemaining !== null ? Math.round(calorieRemaining) : null,
  };
}

// ============================================
// MEAL TYPE HELPERS
// ============================================

/**
 * Suggest meal type based on time of day
 * Uses 24-hour format: 5-11 breakfast, 11-15 lunch, 15-20 dinner, else snack
 */
export function getMealTypeForTime(date: Date): MealType {
  const hour = date.getHours();

  if (hour >= 5 && hour < 11) {
    return MealTypeEnum.BREAKFAST;
  }
  if (hour >= 11 && hour < 15) {
    return MealTypeEnum.LUNCH;
  }
  if (hour >= 15 && hour < 20) {
    return MealTypeEnum.DINNER;
  }

  return MealTypeEnum.SNACK;
}

/**
 * Group meals by meal type for display
 */
export function groupMealsByType(meals: MealWithItems[]): MealsByType {
  const grouped: MealsByType = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
    pre_workout: [],
    post_workout: [],
    untyped: [],
  };

  for (const meal of meals) {
    if (meal.meal_type === null) {
      grouped.untyped.push(meal);
    } else {
      grouped[meal.meal_type].push(meal);
    }
  }

  return grouped;
}

// ============================================
// FORMATTING HELPERS
// ============================================

/**
 * Format meal time for display with bilingual support
 */
export function formatMealTime(date: Date, locale: 'en' | 'pt-BR' = 'en'): string {
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: locale === 'en',
  });
}

/**
 * Get meal type display name
 */
export function getMealTypeDisplayName(
  mealType: MealType | null,
  locale: 'en' | 'pt-BR' = 'en'
): string {
  const names: Record<string, { en: string; 'pt-BR': string }> = {
    breakfast: { en: 'Breakfast', 'pt-BR': 'Café da Manhã' },
    lunch: { en: 'Lunch', 'pt-BR': 'Almoço' },
    dinner: { en: 'Dinner', 'pt-BR': 'Jantar' },
    snack: { en: 'Snack', 'pt-BR': 'Lanche' },
    pre_workout: { en: 'Pre-Workout', 'pt-BR': 'Pré-Treino' },
    post_workout: { en: 'Post-Workout', 'pt-BR': 'Pós-Treino' },
  };

  if (mealType === null) {
    return locale === 'en' ? 'Untyped Meal' : 'Refeição Sem Tipo';
  }

  return names[mealType]?.[locale] ?? mealType;
}

/**
 * Format date for meal logging (YYYY-MM-DD)
 */
export function formatMealDate(date: Date): string {
  return date.toISOString().split('T')[0]!;
}

/**
 * Get date range for meal queries (start and end of day in ISO format)
 */
export function getDayBoundaries(date: Date): { start: string; end: string } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Check if nutritional values are reasonable
 */
export function validateNutritionalValues(values: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Calculate calories from macros (protein: 4cal/g, carbs: 4cal/g, fat: 9cal/g)
  const calculatedCalories = (values.protein * 4) + (values.carbs * 4) + (values.fat * 9);
  const caloriesDiff = Math.abs(values.calories - calculatedCalories);

  // Allow 15% difference for rounding and fiber
  if (caloriesDiff > values.calories * 0.15) {
    errors.push('Calorie count does not match macronutrient breakdown');
  }

  // Check for negative values
  if (values.calories < 0) errors.push('Calories cannot be negative');
  if (values.protein < 0) errors.push('Protein cannot be negative');
  if (values.carbs < 0) errors.push('Carbs cannot be negative');
  if (values.fat < 0) errors.push('Fat cannot be negative');

  // Check for unreasonably high values (per 100g)
  if (values.calories > 1000) errors.push('Calories seem unreasonably high');
  if (values.protein > 100) errors.push('Protein seems unreasonably high');
  if (values.carbs > 100) errors.push('Carbs seem unreasonably high');
  if (values.fat > 100) errors.push('Fat seems unreasonably high');

  return {
    valid: errors.length === 0,
    errors,
  };
}
