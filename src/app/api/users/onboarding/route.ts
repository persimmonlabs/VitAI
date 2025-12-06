import { createClient } from '@/lib/supabase/server';
import { success, badRequest, serverError } from '@/lib/api/response';
import { getAuthenticatedUser } from '@/lib/api/auth';
import { validateBody } from '@/lib/api/validation';
import {
  onboardingDataSchema,
  validateOnboardingData,
  suggestCalorieTarget,
  calculateMacroTargets,
} from '@/domain/user';

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth.success) return auth.response;

  const validation = await validateBody(request, onboardingDataSchema);
  if (!validation.success) return validation.response;

  const onboardingData = validation.data;

  // Validate onboarding data
  const validationResult = validateOnboardingData(onboardingData);
  if (!validationResult.success) {
    return badRequest('Invalid onboarding data', validationResult.errors);
  }

  try {
    const supabase = await createClient();

    // Calculate targets
    const calorieTarget = suggestCalorieTarget({
      weight_kg: onboardingData.weight_kg,
      height_cm: onboardingData.height_cm,
      age: onboardingData.age,
      sex: onboardingData.sex,
      activity_level: onboardingData.activity_level,
      goal_type: onboardingData.goal_type,
    });

    const macros = calculateMacroTargets(calorieTarget);

    // Update profile with onboarding data
    const { data: profile, error: profileError } = await supabase
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
      .eq('id', auth.user.id)
      .select()
      .single();

    if (profileError) {
      console.error('Profile update error:', profileError);
      return serverError('Failed to complete onboarding');
    }

    // Create goal if provided
    if (onboardingData.goal_type && onboardingData.target_weight_kg) {
      await supabase.from('goals').insert({
        user_id: auth.user.id,
        goal_type: onboardingData.goal_type,
        target_weight: onboardingData.target_weight_kg,
        target_weight_unit: 'kg',
        target_date: onboardingData.target_date,
        start_weight: onboardingData.weight_kg,
        start_date: new Date().toISOString().split('T')[0],
        status: 'active',
      });
    }

    // Log initial weight
    await supabase.from('weight_logs').upsert({
      user_id: auth.user.id,
      weight_value: onboardingData.weight_kg,
      weight_unit: 'kg',
      logged_at: new Date().toISOString().split('T')[0],
    }, { onConflict: 'user_id,logged_at' });

    return success({
      profile,
      calculatedTargets: {
        calories: calorieTarget,
        ...macros,
      },
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return serverError('Failed to complete onboarding');
  }
}
