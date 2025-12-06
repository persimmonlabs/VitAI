import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export const FoodSource = {
  USDA: 'usda',
  USER: 'user',
  AI_GENERATED: 'ai_generated',
} as const;
export type FoodSource = (typeof FoodSource)[keyof typeof FoodSource];

// ============================================
// ZOD SCHEMAS
// ============================================

export const foodSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  brand: z.string().max(200).nullable(),
  protein_per_100g: z.number().min(0).max(100),
  carbs_per_100g: z.number().min(0).max(100),
  fat_per_100g: z.number().min(0).max(100),
  fiber_per_100g: z.number().min(0).max(100),
  sugar_per_100g: z.number().min(0).max(100),
  sodium_mg_per_100g: z.number().min(0).max(100000),
  calories_per_100g: z.number().min(0).max(900), // Computed field
  source: z.enum(['usda', 'user', 'ai_generated']).default('user'),
  is_public: z.boolean().default(false),
  created_by: z.string().uuid().nullable(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
}).refine(
  (data) => data.fiber_per_100g <= data.carbs_per_100g,
  {
    message: 'Fiber cannot exceed total carbohydrates',
    path: ['fiber_per_100g'],
  }
).refine(
  (data) => data.sugar_per_100g <= data.carbs_per_100g,
  {
    message: 'Sugar cannot exceed total carbohydrates',
    path: ['sugar_per_100g'],
  }
);

export type Food = z.infer<typeof foodSchema>;

export const foodServingUnitSchema = z.object({
  id: z.string().uuid(),
  food_id: z.string().uuid(),
  unit_name: z.string().min(1).max(50),
  grams_equivalent: z.number().positive().max(10000),
  is_default: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
});

export type FoodServingUnit = z.infer<typeof foodServingUnitSchema>;

// ============================================
// INPUT TYPES
// ============================================

// Base schema without refinements
const baseFoodInputSchema = z.object({
  name: z.string().min(1, 'Food name is required').max(200),
  brand: z.string().max(200).nullable().optional(),
  protein_per_100g: z.number().min(0, 'Protein cannot be negative').max(100, 'Protein cannot exceed 100g per 100g'),
  carbs_per_100g: z.number().min(0, 'Carbs cannot be negative').max(100, 'Carbs cannot exceed 100g per 100g'),
  fat_per_100g: z.number().min(0, 'Fat cannot be negative').max(100, 'Fat cannot exceed 100g per 100g'),
  fiber_per_100g: z.number().min(0, 'Fiber cannot be negative').max(100, 'Fiber cannot exceed 100g per 100g').default(0),
  sugar_per_100g: z.number().min(0, 'Sugar cannot be negative').max(100, 'Sugar cannot exceed 100g per 100g').default(0),
  sodium_mg_per_100g: z.number().min(0, 'Sodium cannot be negative').max(100000).default(0),
  source: z.enum(['usda', 'user', 'ai_generated']).default('user'),
  is_public: z.boolean().default(false),
  created_by: z.string().uuid(),
});

// Create schema with refinements
export const createFoodInputSchema = baseFoodInputSchema.refine(
  (data) => data.fiber_per_100g <= data.carbs_per_100g,
  {
    message: 'Fiber cannot exceed total carbohydrates',
    path: ['fiber_per_100g'],
  }
).refine(
  (data) => data.sugar_per_100g <= data.carbs_per_100g,
  {
    message: 'Sugar cannot exceed total carbohydrates',
    path: ['sugar_per_100g'],
  }
);

export type CreateFoodInput = z.infer<typeof createFoodInputSchema>;

// Update schema - partial of base schema, then apply refinements
export const updateFoodInputSchema = baseFoodInputSchema.partial().omit({ created_by: true }).refine(
  (data) => {
    if (data.fiber_per_100g !== undefined && data.carbs_per_100g !== undefined) {
      return data.fiber_per_100g <= data.carbs_per_100g;
    }
    return true;
  },
  {
    message: 'Fiber cannot exceed total carbohydrates',
    path: ['fiber_per_100g'],
  }
).refine(
  (data) => {
    if (data.sugar_per_100g !== undefined && data.carbs_per_100g !== undefined) {
      return data.sugar_per_100g <= data.carbs_per_100g;
    }
    return true;
  },
  {
    message: 'Sugar cannot exceed total carbohydrates',
    path: ['sugar_per_100g'],
  }
);

export type UpdateFoodInput = z.infer<typeof updateFoodInputSchema>;

export const createFoodServingUnitInputSchema = z.object({
  food_id: z.string().uuid(),
  unit_name: z.string().min(1).max(50),
  grams_equivalent: z.number().positive().max(10000),
  is_default: z.boolean().default(false),
});

export type CreateFoodServingUnitInput = z.infer<typeof createFoodServingUnitInputSchema>;

// ============================================
// COMPUTED TYPES
// ============================================

export interface NutritionForServing {
  quantity: number;
  unit: string;
  grams: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
}

export interface NutritionLabel {
  food_name: string;
  brand: string | null;
  serving_size: string;
  calories: number;
  total_fat: { value: number; unit: string; daily_value?: string };
  saturated_fat?: { value: number; unit: string; daily_value?: string };
  trans_fat?: { value: number; unit: string };
  cholesterol?: { value: number; unit: string; daily_value?: string };
  sodium: { value: number; unit: string; daily_value?: string };
  total_carbs: { value: number; unit: string; daily_value?: string };
  dietary_fiber: { value: number; unit: string; daily_value?: string };
  total_sugars: { value: number; unit: string };
  added_sugars?: { value: number; unit: string; daily_value?: string };
  protein: { value: number; unit: string };
  locale: string;
  labels: {
    serving_size: string;
    calories: string;
    total_fat: string;
    sodium: string;
    total_carbs: string;
    dietary_fiber: string;
    total_sugars: string;
    protein: string;
    daily_value: string;
  };
}

export interface SearchFoodsOptions {
  limit?: number;
  offset?: number;
  source?: FoodSource;
  userId?: string;
  includePublic?: boolean;
}
