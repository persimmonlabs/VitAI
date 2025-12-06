import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export const WeightUnit = {
  KG: 'kg',
  LBS: 'lbs',
} as const;
export type WeightUnit = (typeof WeightUnit)[keyof typeof WeightUnit];

export const GoalType = {
  WEIGHT_LOSS: 'weight_loss',
  WEIGHT_GAIN: 'weight_gain',
  MAINTENANCE: 'maintenance',
} as const;
export type GoalType = (typeof GoalType)[keyof typeof GoalType];

export const GoalStatus = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
} as const;
export type GoalStatus = (typeof GoalStatus)[keyof typeof GoalStatus];

// ============================================
// ENTITY TYPES
// ============================================

export interface WeightLog {
  id: string;
  user_id: string;
  weight_value: number;
  weight_unit: WeightUnit;
  logged_at: string; // ISO date string (YYYY-MM-DD)
  created_at?: string;
}

export interface WeightGoal {
  id: string;
  user_id: string;
  goal_type: GoalType;
  target_weight: number;
  target_weight_unit: WeightUnit;
  target_date: string | null; // ISO date string (YYYY-MM-DD)
  start_weight: number;
  start_date: string; // ISO date string (YYYY-MM-DD)
  status: GoalStatus;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// COMPUTED TYPES
// ============================================

export interface WeightTrend {
  entries: WeightLog[];
  average: number;
  min: number;
  max: number;
  change: number; // First to last
  changePercent: number;
}

export interface GoalProgress {
  current: number;
  target: number;
  start: number;
  progress_percent: number;
  estimated_completion: string | null; // ISO date string
  on_track: boolean;
}

// ============================================
// ZOD SCHEMAS
// ============================================

export const weightLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  weight_value: z.number().positive().max(500),
  weight_unit: z.enum(['kg', 'lbs']),
  logged_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  created_at: z.string().datetime().optional(),
});

export const createWeightLogSchema = z.object({
  user_id: z.string().uuid(),
  weight_value: z.number().positive('Weight must be positive').max(500, 'Weight must be 500 or less'),
  weight_unit: z.enum(['kg', 'lbs']),
  logged_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
});

export type CreateWeightLogInput = z.infer<typeof createWeightLogSchema>;

export const updateWeightLogSchema = z.object({
  weight_value: z.number().positive().max(500).optional(),
  weight_unit: z.enum(['kg', 'lbs']).optional(),
  logged_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type UpdateWeightLogInput = z.infer<typeof updateWeightLogSchema>;

export const weightGoalSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  goal_type: z.enum(['weight_loss', 'weight_gain', 'maintenance']),
  target_weight: z.number().positive().max(500),
  target_weight_unit: z.enum(['kg', 'lbs']),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  start_weight: z.number().positive().max(500),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['active', 'completed', 'abandoned']),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const createGoalSchema = z.object({
  user_id: z.string().uuid(),
  goal_type: z.enum(['weight_loss', 'weight_gain', 'maintenance']),
  target_weight: z.number().positive('Target weight must be positive').max(500),
  target_weight_unit: z.enum(['kg', 'lbs']),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').nullable().optional(),
  start_weight: z.number().positive('Start weight must be positive').max(500),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;

export const updateGoalSchema = z.object({
  target_weight: z.number().positive().max(500).optional(),
  target_weight_unit: z.enum(['kg', 'lbs']).optional(),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  status: z.enum(['active', 'completed', 'abandoned']).optional(),
});

export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;

// ============================================
// OPTIONS & FILTERS
// ============================================

export interface GetWeightLogsOptions {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  limit?: number;
  orderBy?: 'asc' | 'desc';
}

export type TrendPeriod = '7d' | '30d' | '90d';
