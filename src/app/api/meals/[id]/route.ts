import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { success, notFound, forbidden, serverError, noContent } from '@/lib/api/response';
import { getAuthenticatedUser } from '@/lib/api/auth';
import { validateBody, validateParams, uuidSchema } from '@/lib/api/validation';

const paramsSchema = z.object({
  id: uuidSchema,
});

// GET /api/meals/[id]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedUser();
  if (!auth.success) return auth.response;

  const paramsValidation = validateParams(await params, paramsSchema);
  if (!paramsValidation.success) return paramsValidation.response;

  try {
    const supabase = await createClient();

    const { data: meal, error } = await supabase
      .from('meals')
      .select(`
        *,
        meal_items (
          *,
          food:foods (*)
        )
      `)
      .eq('id', paramsValidation.data.id)
      .single();

    if (error || !meal) {
      return notFound('Meal');
    }

    if (meal.user_id !== auth.user.id) {
      return forbidden('You do not have access to this meal');
    }

    return success({ meal });
  } catch (error) {
    console.error('Meal fetch error:', error);
    return serverError('Failed to fetch meal');
  }
}

const updateMealSchema = z.object({
  meal_type: z.enum([
    'breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'
  ]).nullable().optional(),
  logged_at: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});

// PATCH /api/meals/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedUser();
  if (!auth.success) return auth.response;

  const paramsValidation = validateParams(await params, paramsSchema);
  if (!paramsValidation.success) return paramsValidation.response;

  const bodyValidation = await validateBody(request, updateMealSchema);
  if (!bodyValidation.success) return bodyValidation.response;

  try {
    const supabase = await createClient();

    // Check ownership
    const { data: existing } = await supabase
      .from('meals')
      .select('user_id')
      .eq('id', paramsValidation.data.id)
      .single();

    if (!existing) {
      return notFound('Meal');
    }

    if (existing.user_id !== auth.user.id) {
      return forbidden('You do not have access to this meal');
    }

    const { data: meal, error } = await supabase
      .from('meals')
      .update({
        ...bodyValidation.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paramsValidation.data.id)
      .select(`
        *,
        meal_items (
          *,
          food:foods (*)
        )
      `)
      .single();

    if (error) {
      console.error('Meal update error:', error);
      return serverError('Failed to update meal');
    }

    return success({ meal });
  } catch (error) {
    console.error('Meal update error:', error);
    return serverError('Failed to update meal');
  }
}

// DELETE /api/meals/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedUser();
  if (!auth.success) return auth.response;

  const paramsValidation = validateParams(await params, paramsSchema);
  if (!paramsValidation.success) return paramsValidation.response;

  try {
    const supabase = await createClient();

    // Check ownership
    const { data: existing } = await supabase
      .from('meals')
      .select('user_id')
      .eq('id', paramsValidation.data.id)
      .single();

    if (!existing) {
      return notFound('Meal');
    }

    if (existing.user_id !== auth.user.id) {
      return forbidden('You do not have access to this meal');
    }

    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', paramsValidation.data.id);

    if (error) {
      console.error('Meal delete error:', error);
      return serverError('Failed to delete meal');
    }

    return noContent();
  } catch (error) {
    console.error('Meal delete error:', error);
    return serverError('Failed to delete meal');
  }
}
