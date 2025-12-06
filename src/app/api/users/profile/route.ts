import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { success, notFound, serverError } from '@/lib/api/response';
import { getAuthenticatedUser } from '@/lib/api/auth';
import { validateBody } from '@/lib/api/validation';

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth.success) return auth.response;

  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from('users_profile')
    .select('*')
    .eq('id', auth.user.id)
    .single();

  if (error || !profile) {
    return notFound('Profile');
  }

  return success({ profile });
}

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  age: z.number().int().min(13).max(120).optional(),
  sex: z.enum(['male', 'female']).optional(),
  height_cm: z.number().positive().max(300).optional(),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
  daily_calorie_target: z.number().int().min(500).max(10000).optional(),
  protein_target_g: z.number().int().min(0).optional(),
  carbs_target_g: z.number().int().min(0).optional(),
  fat_target_g: z.number().int().min(0).optional(),
});

export async function PATCH(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth.success) return auth.response;

  const validation = await validateBody(request, updateProfileSchema);
  if (!validation.success) return validation.response;

  try {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from('users_profile')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', auth.user.id)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return serverError('Failed to update profile');
    }

    return success({ profile });
  } catch (error) {
    console.error('Profile update error:', error);
    return serverError('Failed to update profile');
  }
}
