import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export const MealType = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACK: 'snack',
  PRE_WORKOUT: 'pre_workout',
  POST_WORKOUT: 'post_workout',
} as const;
export type MealType = (typeof MealType)[keyof typeof MealType];

export const FoodUnit = {
  G: 'g',
  OZ: 'oz',
  ML: 'ml',
  CUP: 'cup',
  TBSP: 'tbsp',
  TSP: 'tsp',
  PIECE: 'piece',
  SERVING: 'serving',
} as const;
export type FoodUnit = (typeof FoodUnit)[keyof typeof FoodUnit];

// ============================================
// ZOD SCHEMAS
// ============================================

export const mealSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout']).nullable(),
  logged_at: z.string().datetime(),
  notes: z.string().max(500).nullable().optional(),
  total_calories: z.number().int().min(0).default(0),
  total_protein: z.number().min(0).default(0),
  total_carbs: z.number().min(0).default(0),
  total_fat: z.number().min(0).default(0),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type Meal = z.infer<typeof mealSchema>;

export const mealItemSchema = z.object({
  id: z.string().uuid(),
  meal_id: z.string().uuid(),
  food_id: z.string().uuid(),
  quantity: z.number().positive(),
  unit: z.enum(['g', 'oz', 'ml', 'cup', 'tbsp', 'tsp', 'piece', 'serving']),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  created_at: z.string().datetime().optional(),
});

export type MealItem = z.infer<typeof mealItemSchema>;

export const createMealInputSchema = z.object({
  user_id: z.string().uuid(),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout']).nullable().optional(),
  logged_at: z.string().datetime().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export type CreateMealInput = z.infer<typeof createMealInputSchema>;

export const updateMealInputSchema = z.object({
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout']).nullable().optional(),
  logged_at: z.string().datetime().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export type UpdateMealInput = z.infer<typeof updateMealInputSchema>;

export const createMealItemInputSchema = z.object({
  meal_id: z.string().uuid(),
  food_id: z.string().uuid(),
  quantity: z.number().positive(),
  unit: z.enum(['g', 'oz', 'ml', 'cup', 'tbsp', 'tsp', 'piece', 'serving']),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
});

export type CreateMealItemInput = z.infer<typeof createMealItemInputSchema>;

export const updateMealItemInputSchema = z.object({
  quantity: z.number().positive().optional(),
  unit: z.enum(['g', 'oz', 'ml', 'cup', 'tbsp', 'tsp', 'piece', 'serving']).optional(),
  calories: z.number().min(0).optional(),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
});

export type UpdateMealItemInput = z.infer<typeof updateMealItemInputSchema>;

// ============================================
// COMPOSITE TYPES
// ============================================

export interface MealWithItems extends Meal {
  items: MealItem[];
}

export interface DailySummary {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meal_count: number;
  calorie_target: number | null;
  calorie_remaining: number | null;
}

export interface MealsByType {
  breakfast: MealWithItems[];
  lunch: MealWithItems[];
  dinner: MealWithItems[];
  snack: MealWithItems[];
  pre_workout: MealWithItems[];
  post_workout: MealWithItems[];
  untyped: MealWithItems[];
}

// ============================================
// NUTRITIONAL TOTALS
// ============================================

export interface NutritionalTotals {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}
