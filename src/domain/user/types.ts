import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export const UnitSystem = {
  METRIC: 'metric',
  IMPERIAL: 'imperial',
} as const;
export type UnitSystem = (typeof UnitSystem)[keyof typeof UnitSystem];

export const ActivityLevel = {
  SEDENTARY: 'sedentary',
  LIGHT: 'light',
  MODERATE: 'moderate',
  ACTIVE: 'active',
  VERY_ACTIVE: 'very_active',
} as const;
export type ActivityLevel = (typeof ActivityLevel)[keyof typeof ActivityLevel];

export const Language = {
  EN: 'en',
  PT_BR: 'pt-BR',
} as const;
export type Language = (typeof Language)[keyof typeof Language];

export const Sex = {
  MALE: 'male',
  FEMALE: 'female',
} as const;
export type Sex = (typeof Sex)[keyof typeof Sex];

export const GoalType = {
  WEIGHT_LOSS: 'weight_loss',
  WEIGHT_GAIN: 'weight_gain',
  MAINTENANCE: 'maintenance',
} as const;
export type GoalType = (typeof GoalType)[keyof typeof GoalType];

export const WeightUnit = {
  KG: 'kg',
  LBS: 'lbs',
} as const;
export type WeightUnit = (typeof WeightUnit)[keyof typeof WeightUnit];

// ============================================
// ACTIVITY MULTIPLIERS
// ============================================

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  [ActivityLevel.SEDENTARY]: 1.2,
  [ActivityLevel.LIGHT]: 1.375,
  [ActivityLevel.MODERATE]: 1.55,
  [ActivityLevel.ACTIVE]: 1.725,
  [ActivityLevel.VERY_ACTIVE]: 1.9,
};

// ============================================
// CONVERSION CONSTANTS
// ============================================

export const CONVERSIONS = {
  KG_TO_LBS: 2.20462,
  LBS_TO_KG: 0.453592,
  CM_TO_INCHES: 0.393701,
  INCHES_TO_CM: 2.54,
} as const;

// ============================================
// ZOD SCHEMAS
// ============================================

export const userProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(13).max(120).nullable(),
  sex: z.enum(['male', 'female']).nullable(),
  height_cm: z.number().positive().max(300).nullable(),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).default('moderate'),
  unit_system: z.enum(['metric', 'imperial']).default('metric'),
  timezone: z.string().default('UTC'),
  language: z.enum(['en', 'pt-BR']).default('en'),
  daily_calorie_target: z.number().int().min(500).max(10000).nullable(),
  protein_target_g: z.number().int().min(0).nullable(),
  carbs_target_g: z.number().int().min(0).nullable(),
  fat_target_g: z.number().int().min(0).nullable(),
  onboarding_completed: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

export const onboardingDataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().int().min(13, 'Must be at least 13 years old').max(120, 'Age must be 120 or less'),
  sex: z.enum(['male', 'female']),
  height_cm: z.number().positive('Height must be positive').max(300),
  weight_kg: z.number().positive('Weight must be positive').max(500),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goal_type: z.enum(['weight_loss', 'weight_gain', 'maintenance']).optional(),
  target_weight_kg: z.number().positive().max(500).optional(),
  target_date: z.string().datetime().optional(),
  unit_system: z.enum(['metric', 'imperial']).default('metric'),
  language: z.enum(['en', 'pt-BR']).default('en'),
  timezone: z.string().default('UTC'),
});

export type OnboardingData = z.infer<typeof onboardingDataSchema>;

export const userPreferencesSchema = z.object({
  unit_system: z.enum(['metric', 'imperial']),
  language: z.enum(['en', 'pt-BR']),
  timezone: z.string(),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export const createProfileInputSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
});

export type CreateProfileInput = z.infer<typeof createProfileInputSchema>;

export const updateProfileInputSchema = userProfileSchema.partial().omit({ id: true, created_at: true });

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;

// ============================================
// PASSWORD VALIDATION
// ============================================

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

export type Password = z.infer<typeof passwordSchema>;

// ============================================
// COMPUTED TYPES
// ============================================

export interface BMRInput {
  weight_kg: number;
  height_cm: number;
  age: number;
  sex: Sex;
}

export interface TDEEInput extends BMRInput {
  activity_level: ActivityLevel;
}

export interface CalorieTargetInput extends TDEEInput {
  goal_type?: GoalType;
}
