import {
  type BMRInput,
  type TDEEInput,
  type CalorieTargetInput,
  type OnboardingData,
  type GoalType,
  type WeightUnit,
  Sex as SexEnum,
  GoalType as GoalTypeEnum,
  ACTIVITY_MULTIPLIERS,
  CONVERSIONS,
  onboardingDataSchema,
} from './types';

// ============================================
// VALIDATION
// ============================================

/**
 * Validates onboarding data with comprehensive checks
 */
export function validateOnboardingData(data: unknown): {
  success: true;
  data: OnboardingData;
} | {
  success: false;
  errors: { path: string; message: string }[];
} {
  const result = onboardingDataSchema.safeParse(data);

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
// BMR & TDEE CALCULATIONS
// ============================================

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation
 *
 * Male: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
 * Female: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
 */
export function calculateBMR(input: BMRInput): number {
  const { weight_kg, height_cm, age, sex } = input;

  const baseBMR = (10 * weight_kg) + (6.25 * height_cm) - (5 * age);

  if (sex === SexEnum.MALE) {
    return Math.round(baseBMR + 5);
  }

  return Math.round(baseBMR - 161);
}

/**
 * Calculate Total Daily Energy Expenditure
 * TDEE = BMR × Activity Multiplier
 */
export function calculateTDEE(input: TDEEInput): number {
  const bmr = calculateBMR(input);
  const multiplier = ACTIVITY_MULTIPLIERS[input.activity_level];

  return Math.round(bmr * multiplier);
}

/**
 * Suggest daily calorie target based on TDEE and goal
 *
 * - Weight loss: TDEE - 500 (1 lb/week loss)
 * - Weight gain: TDEE + 300 (lean gain)
 * - Maintenance: TDEE
 */
export function suggestCalorieTarget(input: CalorieTargetInput): number {
  const tdee = calculateTDEE(input);
  const goalType = input.goal_type ?? GoalTypeEnum.MAINTENANCE;

  switch (goalType) {
    case GoalTypeEnum.WEIGHT_LOSS:
      // Minimum 1200 calories for safety
      return Math.max(1200, tdee - 500);
    case GoalTypeEnum.WEIGHT_GAIN:
      return tdee + 300;
    case GoalTypeEnum.MAINTENANCE:
    default:
      return tdee;
  }
}

/**
 * Calculate recommended macro targets based on calorie target
 *
 * Balanced split:
 * - Protein: 30% (4 cal/g)
 * - Carbs: 40% (4 cal/g)
 * - Fat: 30% (9 cal/g)
 */
export function calculateMacroTargets(calorieTarget: number): {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
} {
  return {
    protein_g: Math.round((calorieTarget * 0.30) / 4),
    carbs_g: Math.round((calorieTarget * 0.40) / 4),
    fat_g: Math.round((calorieTarget * 0.30) / 9),
  };
}

// ============================================
// UNIT CONVERSIONS
// ============================================

/**
 * Convert weight between kg and lbs
 */
export function convertWeight(
  value: number,
  from: WeightUnit,
  to: WeightUnit
): number {
  if (from === to) return value;

  if (from === 'kg' && to === 'lbs') {
    return Math.round(value * CONVERSIONS.KG_TO_LBS * 10) / 10;
  }

  // lbs to kg
  return Math.round(value * CONVERSIONS.LBS_TO_KG * 10) / 10;
}

/**
 * Convert height between cm and inches
 */
export function convertHeight(
  value: number,
  from: 'cm' | 'in',
  to: 'cm' | 'in'
): number {
  if (from === to) return value;

  if (from === 'cm' && to === 'in') {
    return Math.round(value * CONVERSIONS.CM_TO_INCHES * 10) / 10;
  }

  // inches to cm
  return Math.round(value * CONVERSIONS.INCHES_TO_CM * 10) / 10;
}

/**
 * Convert height from feet/inches to cm
 */
export function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = (feet * 12) + inches;
  return Math.round(totalInches * CONVERSIONS.INCHES_TO_CM * 10) / 10;
}

/**
 * Convert height from cm to feet/inches
 */
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm * CONVERSIONS.CM_TO_INCHES;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);

  return { feet, inches };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate weight change needed to reach target
 */
export function calculateWeightDelta(
  currentWeight: number,
  targetWeight: number,
  _unit: WeightUnit = 'kg'
): { delta: number; direction: 'lose' | 'gain' | 'maintain' } {
  const delta = Math.round((targetWeight - currentWeight) * 10) / 10;

  if (Math.abs(delta) < 0.5) {
    return { delta: 0, direction: 'maintain' };
  }

  return {
    delta: Math.abs(delta),
    direction: delta < 0 ? 'lose' : 'gain',
  };
}

/**
 * Estimate weeks to reach weight goal
 * Assumes safe rate: 0.5-1 kg/week for loss, 0.25-0.5 kg/week for gain
 */
export function estimateWeeksToGoal(
  currentWeight: number,
  targetWeight: number,
  goalType: GoalType
): { minWeeks: number; maxWeeks: number } {
  const delta = Math.abs(targetWeight - currentWeight);

  if (delta < 0.5) {
    return { minWeeks: 0, maxWeeks: 0 };
  }

  if (goalType === GoalTypeEnum.WEIGHT_LOSS) {
    // 0.5-1 kg per week
    return {
      minWeeks: Math.ceil(delta / 1),
      maxWeeks: Math.ceil(delta / 0.5),
    };
  }

  if (goalType === GoalTypeEnum.WEIGHT_GAIN) {
    // 0.25-0.5 kg per week (lean gain)
    return {
      minWeeks: Math.ceil(delta / 0.5),
      maxWeeks: Math.ceil(delta / 0.25),
    };
  }

  return { minWeeks: 0, maxWeeks: 0 };
}

/**
 * Get activity level description
 */
export function getActivityLevelDescription(level: string): {
  en: string;
  'pt-BR': string;
} {
  const descriptions: Record<string, { en: string; 'pt-BR': string }> = {
    sedentary: {
      en: 'Little or no exercise, desk job',
      'pt-BR': 'Pouco ou nenhum exercício, trabalho de escritório',
    },
    light: {
      en: 'Light exercise 1-3 days per week',
      'pt-BR': 'Exercício leve 1-3 dias por semana',
    },
    moderate: {
      en: 'Moderate exercise 3-5 days per week',
      'pt-BR': 'Exercício moderado 3-5 dias por semana',
    },
    active: {
      en: 'Hard exercise 6-7 days per week',
      'pt-BR': 'Exercício intenso 6-7 dias por semana',
    },
    very_active: {
      en: 'Very hard exercise, physical job',
      'pt-BR': 'Exercício muito intenso, trabalho físico',
    },
  };

  return descriptions[level] ?? descriptions['moderate']!;
}
