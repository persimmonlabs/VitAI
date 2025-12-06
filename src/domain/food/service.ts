import type {
  Food,
  FoodServingUnit,
  NutritionForServing,
  NutritionLabel,
  CreateFoodInput,
  UpdateFoodInput,
} from './types';
import { createFoodInputSchema, updateFoodInputSchema } from './types';

// ============================================
// MACRONUTRIENT CALORIE CONSTANTS
// ============================================

const CALORIES_PER_GRAM = {
  PROTEIN: 4,
  CARBS: 4,
  FAT: 9,
} as const;

// ============================================
// VALIDATION
// ============================================

/**
 * Validates food data with comprehensive checks
 */
export function validateFoodData(data: unknown, isUpdate = false): {
  success: true;
  data: CreateFoodInput | UpdateFoodInput;
} | {
  success: false;
  errors: { path: string; message: string }[];
} {
  const schema = isUpdate ? updateFoodInputSchema : createFoodInputSchema;
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    })),
  };
}

// ============================================
// CALORIE CALCULATIONS
// ============================================

/**
 * Calculate calories from macronutrients
 * Formula: (protein × 4) + (carbs × 4) + (fat × 9)
 *
 * @param protein - Grams of protein
 * @param carbs - Grams of carbohydrates
 * @param fat - Grams of fat
 * @returns Calculated calories
 */
export function calculateCaloriesFromMacros(
  protein: number,
  carbs: number,
  fat: number
): number {
  const calories = (
    (protein * CALORIES_PER_GRAM.PROTEIN) +
    (carbs * CALORIES_PER_GRAM.CARBS) +
    (fat * CALORIES_PER_GRAM.FAT)
  );

  return Math.round(calories);
}

// ============================================
// UNIT CONVERSIONS
// ============================================

/**
 * Convert a serving quantity to grams
 *
 * @param quantity - The amount in the specified unit
 * @param unit - The unit name (e.g., "cup", "tbsp")
 * @param gramsEquivalent - Grams per unit (from FoodServingUnit)
 * @returns Weight in grams
 */
export function convertToGrams(
  quantity: number,
  unit: string,
  gramsEquivalent: number
): number {
  if (unit.toLowerCase() === 'g' || unit.toLowerCase() === 'grams') {
    return Math.round(quantity * 10) / 10;
  }

  return Math.round(quantity * gramsEquivalent * 10) / 10;
}

// ============================================
// NUTRITION CALCULATIONS
// ============================================

/**
 * Calculate nutrition information for a specific serving
 *
 * @param food - The food item
 * @param quantity - Amount of the serving
 * @param servingUnit - Serving unit information (optional, defaults to grams)
 * @returns Detailed nutrition breakdown
 */
export function calculateNutritionForServing(
  food: Food,
  quantity: number,
  servingUnit?: FoodServingUnit
): NutritionForServing {
  const unit = servingUnit?.unit_name || 'g';
  const gramsEquivalent = servingUnit?.grams_equivalent || 1;
  const grams = convertToGrams(quantity, unit, gramsEquivalent);

  // Calculate nutrition per gram, then multiply by total grams
  const multiplier = grams / 100;

  const protein_g = Math.round(food.protein_per_100g * multiplier * 10) / 10;
  const carbs_g = Math.round(food.carbs_per_100g * multiplier * 10) / 10;
  const fat_g = Math.round(food.fat_per_100g * multiplier * 10) / 10;
  const fiber_g = Math.round(food.fiber_per_100g * multiplier * 10) / 10;
  const sugar_g = Math.round(food.sugar_per_100g * multiplier * 10) / 10;
  const sodium_mg = Math.round(food.sodium_mg_per_100g * multiplier * 10) / 10;

  const calories = calculateCaloriesFromMacros(protein_g, carbs_g, fat_g);

  return {
    quantity,
    unit,
    grams,
    calories,
    protein_g,
    carbs_g,
    fat_g,
    fiber_g,
    sugar_g,
    sodium_mg,
  };
}

// ============================================
// NUTRITION LABEL FORMATTING
// ============================================

/**
 * Format nutrition information as a standardized label
 *
 * @param food - The food item
 * @param locale - Language/locale ('en' or 'pt-BR')
 * @param servingSize - Optional custom serving size (defaults to 100g)
 * @returns Formatted nutrition label with localized text
 */
export function formatNutritionLabel(
  food: Food,
  locale: 'en' | 'pt-BR' = 'en',
  servingSize?: NutritionForServing
): NutritionLabel {
  // Default to 100g serving if not specified
  const serving = servingSize || calculateNutritionForServing(food, 100);

  // Localized labels
  const labels = {
    en: {
      serving_size: 'Serving Size',
      calories: 'Calories',
      total_fat: 'Total Fat',
      sodium: 'Sodium',
      total_carbs: 'Total Carbohydrates',
      dietary_fiber: 'Dietary Fiber',
      total_sugars: 'Total Sugars',
      protein: 'Protein',
      daily_value: '% Daily Value',
    },
    'pt-BR': {
      serving_size: 'Porção',
      calories: 'Calorias',
      total_fat: 'Gorduras Totais',
      sodium: 'Sódio',
      total_carbs: 'Carboidratos Totais',
      dietary_fiber: 'Fibra Alimentar',
      total_sugars: 'Açúcares Totais',
      protein: 'Proteínas',
      daily_value: '% Valor Diário',
    },
  };

  const localizedLabels = labels[locale];

  // Calculate daily value percentages (based on 2000 calorie diet)
  const fatDV = Math.round((serving.fat_g / 78) * 100); // 78g daily value for fat
  const sodiumDV = Math.round((serving.sodium_mg / 2300) * 100); // 2300mg daily value for sodium
  const carbsDV = Math.round((serving.carbs_g / 275) * 100); // 275g daily value for carbs
  const fiberDV = Math.round((serving.fiber_g / 28) * 100); // 28g daily value for fiber

  return {
    food_name: food.name,
    brand: food.brand,
    serving_size: `${serving.quantity} ${serving.unit} (${serving.grams}g)`,
    calories: serving.calories,
    total_fat: {
      value: serving.fat_g,
      unit: 'g',
      daily_value: `${fatDV}%`,
    },
    sodium: {
      value: serving.sodium_mg,
      unit: 'mg',
      daily_value: `${sodiumDV}%`,
    },
    total_carbs: {
      value: serving.carbs_g,
      unit: 'g',
      daily_value: `${carbsDV}%`,
    },
    dietary_fiber: {
      value: serving.fiber_g,
      unit: 'g',
      daily_value: `${fiberDV}%`,
    },
    total_sugars: {
      value: serving.sugar_g,
      unit: 'g',
    },
    protein: {
      value: serving.protein_g,
      unit: 'g',
    },
    locale,
    labels: localizedLabels,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate the caloric density of a food (calories per gram)
 *
 * @param food - The food item
 * @returns Calories per gram
 */
export function calculateCaloricDensity(food: Food): number {
  return Math.round((food.calories_per_100g / 100) * 100) / 100;
}

/**
 * Determine if a food is high in a specific macro
 *
 * @param food - The food item
 * @param macro - The macronutrient to check ('protein', 'carbs', or 'fat')
 * @returns True if the food is high in that macro
 */
export function isHighInMacro(
  food: Food,
  macro: 'protein' | 'carbs' | 'fat'
): boolean {
  const thresholds = {
    protein: 20, // 20g+ per 100g is high protein
    carbs: 60,   // 60g+ per 100g is high carb
    fat: 20,     // 20g+ per 100g is high fat
  };

  const value = macro === 'protein'
    ? food.protein_per_100g
    : macro === 'carbs'
    ? food.carbs_per_100g
    : food.fat_per_100g;

  return value >= thresholds[macro];
}

/**
 * Get the macro split as percentages
 *
 * @param food - The food item
 * @returns Percentage of calories from each macro
 */
export function getMacroSplit(food: Food): {
  protein_percent: number;
  carbs_percent: number;
  fat_percent: number;
} {
  const proteinCal = food.protein_per_100g * CALORIES_PER_GRAM.PROTEIN;
  const carbsCal = food.carbs_per_100g * CALORIES_PER_GRAM.CARBS;
  const fatCal = food.fat_per_100g * CALORIES_PER_GRAM.FAT;
  const totalCal = food.calories_per_100g;

  if (totalCal === 0) {
    return { protein_percent: 0, carbs_percent: 0, fat_percent: 0 };
  }

  return {
    protein_percent: Math.round((proteinCal / totalCal) * 100),
    carbs_percent: Math.round((carbsCal / totalCal) * 100),
    fat_percent: Math.round((fatCal / totalCal) * 100),
  };
}
