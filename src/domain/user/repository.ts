import { createClient } from '@/lib/supabase/client';
import type {
  UserProfile,
  CreateProfileInput,
  UpdateProfileInput,
  OnboardingData,
  UserPreferences,
} from './types';
import {
  suggestCalorieTarget,
  calculateMacroTargets,
} from './service';

// ============================================
// TYPES
// ============================================

export interface UserRepository {
  getUserProfile(userId: string): Promise<UserProfile | null>;
  createUserProfile(data: CreateProfileInput): Promise<UserProfile>;
  updateUserProfile(userId: string, data: UpdateProfileInput): Promise<UserProfile>;
  completeOnboarding(userId: string, data: OnboardingData): Promise<UserProfile>;
  updatePreferences(userId: string, preferences: UserPreferences): Promise<UserProfile>;
  deleteUserProfile(userId: string): Promise<void>;
}

// ============================================
// REPOSITORY IMPLEMENTATION
// ============================================

export function createUserRepository(): UserRepository {
  const supabase = createClient();

  return {
    async getUserProfile(userId: string): Promise<UserProfile | null> {
      const { data, error } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw new Error(`Failed to get user profile: ${error.message}`);
      }

      return data as UserProfile;
    },

    async createUserProfile(input: CreateProfileInput): Promise<UserProfile> {
      const { data, error } = await supabase
        .from('users_profile')
        .insert({
          id: input.id,
          name: input.name,
          email: input.email,
          onboarding_completed: false,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create user profile: ${error.message}`);
      }

      return data as UserProfile;
    },

    async updateUserProfile(
      userId: string,
      input: UpdateProfileInput
    ): Promise<UserProfile> {
      const { data, error } = await supabase
        .from('users_profile')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update user profile: ${error.message}`);
      }

      return data as UserProfile;
    },

    async completeOnboarding(
      userId: string,
      onboardingData: OnboardingData
    ): Promise<UserProfile> {
      // Calculate targets based on onboarding data
      const calorieTarget = suggestCalorieTarget({
        weight_kg: onboardingData.weight_kg,
        height_cm: onboardingData.height_cm,
        age: onboardingData.age,
        sex: onboardingData.sex,
        activity_level: onboardingData.activity_level,
        goal_type: onboardingData.goal_type,
      });

      const macros = calculateMacroTargets(calorieTarget);

      const { data, error } = await supabase
        .from('users_profile')
        .update({
          name: onboardingData.name,
          age: onboardingData.age,
          sex: onboardingData.sex,
          height_cm: onboardingData.height_cm,
          activity_level: onboardingData.activity_level,
          unit_system: onboardingData.unit_system,
          language: onboardingData.language,
          timezone: onboardingData.timezone,
          daily_calorie_target: calorieTarget,
          protein_target_g: macros.protein_g,
          carbs_target_g: macros.carbs_g,
          fat_target_g: macros.fat_g,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to complete onboarding: ${error.message}`);
      }

      // If user has a weight goal, create it
      if (onboardingData.goal_type && onboardingData.target_weight_kg) {
        const { error: goalError } = await supabase
          .from('goals')
          .insert({
            user_id: userId,
            goal_type: onboardingData.goal_type,
            target_weight: onboardingData.target_weight_kg,
            target_weight_unit: 'kg',
            target_date: onboardingData.target_date,
            start_weight: onboardingData.weight_kg,
            start_date: new Date().toISOString().split('T')[0],
            status: 'active',
          });

        if (goalError) {
          console.error('Failed to create goal:', goalError.message);
          // Don't throw - onboarding can succeed without goal
        }

        // Log initial weight
        const { error: weightError } = await supabase
          .from('weight_logs')
          .insert({
            user_id: userId,
            weight_value: onboardingData.weight_kg,
            weight_unit: 'kg',
            logged_at: new Date().toISOString().split('T')[0],
          });

        if (weightError && weightError.code !== '23505') {
          // Ignore duplicate key errors (user already logged weight today)
          console.error('Failed to log initial weight:', weightError.message);
        }
      }

      return data as UserProfile;
    },

    async updatePreferences(
      userId: string,
      preferences: UserPreferences
    ): Promise<UserProfile> {
      const { data, error } = await supabase
        .from('users_profile')
        .update({
          unit_system: preferences.unit_system,
          language: preferences.language,
          timezone: preferences.timezone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update preferences: ${error.message}`);
      }

      return data as UserProfile;
    },

    async deleteUserProfile(userId: string): Promise<void> {
      const { error } = await supabase
        .from('users_profile')
        .delete()
        .eq('id', userId);

      if (error) {
        throw new Error(`Failed to delete user profile: ${error.message}`);
      }
    },
  };
}

// ============================================
// SERVER REPOSITORY (for API routes)
// ============================================

export async function createServerUserRepository() {
  const { createClient: createServerClient } = await import('@/lib/supabase/server');
  const supabase = await createServerClient();

  // Same implementation but with server client
  return {
    async getUserProfile(userId: string): Promise<UserProfile | null> {
      const { data, error } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to get user profile: ${error.message}`);
      }

      return data as UserProfile;
    },

    // ... other methods similar to client repository
  };
}
