import { describe, it, expect } from 'vitest';
import {
  userProfileSchema,
  onboardingDataSchema,
  passwordSchema,
  UnitSystem,
  ActivityLevel,
  Language,
  Sex,
  GoalType,
  WeightUnit,
  ACTIVITY_MULTIPLIERS,
  CONVERSIONS,
} from '../types';

describe('User Types', () => {
  describe('Enums', () => {
    it('UnitSystem has correct values', () => {
      expect(UnitSystem.METRIC).toBe('metric');
      expect(UnitSystem.IMPERIAL).toBe('imperial');
    });

    it('ActivityLevel has all 5 levels', () => {
      expect(ActivityLevel.SEDENTARY).toBe('sedentary');
      expect(ActivityLevel.LIGHT).toBe('light');
      expect(ActivityLevel.MODERATE).toBe('moderate');
      expect(ActivityLevel.ACTIVE).toBe('active');
      expect(ActivityLevel.VERY_ACTIVE).toBe('very_active');
    });

    it('Language supports EN and PT-BR', () => {
      expect(Language.EN).toBe('en');
      expect(Language.PT_BR).toBe('pt-BR');
    });

    it('Sex has male and female', () => {
      expect(Sex.MALE).toBe('male');
      expect(Sex.FEMALE).toBe('female');
    });

    it('GoalType has all goal types', () => {
      expect(GoalType.WEIGHT_LOSS).toBe('weight_loss');
      expect(GoalType.WEIGHT_GAIN).toBe('weight_gain');
      expect(GoalType.MAINTENANCE).toBe('maintenance');
    });

    it('WeightUnit has kg and lbs', () => {
      expect(WeightUnit.KG).toBe('kg');
      expect(WeightUnit.LBS).toBe('lbs');
    });
  });

  describe('Constants', () => {
    it('ACTIVITY_MULTIPLIERS are correct', () => {
      expect(ACTIVITY_MULTIPLIERS.sedentary).toBe(1.2);
      expect(ACTIVITY_MULTIPLIERS.light).toBe(1.375);
      expect(ACTIVITY_MULTIPLIERS.moderate).toBe(1.55);
      expect(ACTIVITY_MULTIPLIERS.active).toBe(1.725);
      expect(ACTIVITY_MULTIPLIERS.very_active).toBe(1.9);
    });

    it('CONVERSIONS are correct', () => {
      expect(CONVERSIONS.KG_TO_LBS).toBeCloseTo(2.20462, 4);
      expect(CONVERSIONS.LBS_TO_KG).toBeCloseTo(0.453592, 4);
      expect(CONVERSIONS.CM_TO_INCHES).toBeCloseTo(0.393701, 4);
      expect(CONVERSIONS.INCHES_TO_CM).toBe(2.54);
    });
  });

  describe('userProfileSchema', () => {
    const validProfile = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      sex: 'male',
      height_cm: 180,
      activity_level: 'moderate',
      unit_system: 'metric',
      timezone: 'America/New_York',
      language: 'en',
      daily_calorie_target: 2000,
      protein_target_g: 150,
      carbs_target_g: 200,
      fat_target_g: 67,
      onboarding_completed: true,
    };

    it('accepts valid profile', () => {
      const result = userProfileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it('requires valid UUID for id', () => {
      const result = userProfileSchema.safeParse({
        ...validProfile,
        id: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('requires valid email', () => {
      const result = userProfileSchema.safeParse({
        ...validProfile,
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });

    it('enforces age range 13-120', () => {
      expect(
        userProfileSchema.safeParse({ ...validProfile, age: 12 }).success
      ).toBe(false);
      expect(
        userProfileSchema.safeParse({ ...validProfile, age: 121 }).success
      ).toBe(false);
      expect(
        userProfileSchema.safeParse({ ...validProfile, age: 13 }).success
      ).toBe(true);
      expect(
        userProfileSchema.safeParse({ ...validProfile, age: 120 }).success
      ).toBe(true);
    });

    it('enforces calorie target range 500-10000', () => {
      expect(
        userProfileSchema.safeParse({ ...validProfile, daily_calorie_target: 499 }).success
      ).toBe(false);
      expect(
        userProfileSchema.safeParse({ ...validProfile, daily_calorie_target: 10001 }).success
      ).toBe(false);
      expect(
        userProfileSchema.safeParse({ ...validProfile, daily_calorie_target: 500 }).success
      ).toBe(true);
    });

    it('allows null for optional fields', () => {
      const result = userProfileSchema.safeParse({
        ...validProfile,
        age: null,
        sex: null,
        height_cm: null,
        daily_calorie_target: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('onboardingDataSchema', () => {
    const validOnboarding = {
      name: 'Jane Doe',
      age: 25,
      sex: 'female',
      height_cm: 165,
      weight_kg: 60,
      activity_level: 'light',
      unit_system: 'metric',
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
    };

    it('accepts valid onboarding data', () => {
      const result = onboardingDataSchema.safeParse(validOnboarding);
      expect(result.success).toBe(true);
    });

    it('requires all mandatory fields', () => {
      const incomplete = {
        name: 'Jane',
        age: 25,
        // Missing other required fields
      };
      const result = onboardingDataSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });

    it('applies defaults for optional fields', () => {
      const minimal = {
        name: 'Jane',
        age: 25,
        sex: 'female',
        height_cm: 165,
        weight_kg: 60,
        activity_level: 'moderate',
      };
      const result = onboardingDataSchema.safeParse(minimal);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.unit_system).toBe('metric');
        expect(result.data.language).toBe('en');
        expect(result.data.timezone).toBe('UTC');
      }
    });

    it('accepts optional goal fields', () => {
      const withGoal = {
        ...validOnboarding,
        goal_type: 'weight_loss',
        target_weight_kg: 55,
      };
      const result = onboardingDataSchema.safeParse(withGoal);
      expect(result.success).toBe(true);
    });
  });

  describe('passwordSchema', () => {
    it('rejects passwords under 8 characters', () => {
      const result = passwordSchema.safeParse('Short1!');
      expect(result.success).toBe(false);
    });

    it('requires uppercase letter', () => {
      const result = passwordSchema.safeParse('lowercase1!');
      expect(result.success).toBe(false);
    });

    it('requires lowercase letter', () => {
      const result = passwordSchema.safeParse('UPPERCASE1!');
      expect(result.success).toBe(false);
    });

    it('requires number', () => {
      const result = passwordSchema.safeParse('NoNumbers!');
      expect(result.success).toBe(false);
    });

    it('requires special character', () => {
      const result = passwordSchema.safeParse('NoSpecial1');
      expect(result.success).toBe(false);
    });

    it('accepts valid password', () => {
      const result = passwordSchema.safeParse('ValidPass1!');
      expect(result.success).toBe(true);
    });

    it('accepts complex passwords', () => {
      const complexPasswords = [
        'MyP@ssw0rd!',
        'Super$ecure123',
        'Test!ng1234',
        'C0mpl3x#Pass',
      ];

      complexPasswords.forEach((password) => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(true);
      });
    });
  });
});
