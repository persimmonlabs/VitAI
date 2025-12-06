import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { success, created, serverError } from '@/lib/api/response';
import { getAuthenticatedUser } from '@/lib/api/auth';
import { validateBody } from '@/lib/api/validation';

// GET /api/weight?days=30
export async function GET(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth.success) return auth.response;

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') ?? '30', 10);

  try {
    const supabase = await createClient();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: logs, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', auth.user.id)
      .gte('logged_at', startDate.toISOString().split('T')[0])
      .order('logged_at', { ascending: false });

    if (error) {
      console.error('Weight logs fetch error:', error);
      return serverError('Failed to fetch weight logs');
    }

    return success({ logs, days });
  } catch (error) {
    console.error('Weight logs fetch error:', error);
    return serverError('Failed to fetch weight logs');
  }
}

const logWeightSchema = z.object({
  weight_value: z.number().positive().max(1000),
  weight_unit: z.enum(['kg', 'lbs']).default('kg'),
  logged_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// POST /api/weight
export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth.success) return auth.response;

  const validation = await validateBody(request, logWeightSchema);
  if (!validation.success) return validation.response;

  const { weight_value, weight_unit, logged_at } = validation.data;
  const date = logged_at ?? new Date().toISOString().split('T')[0];

  try {
    const supabase = await createClient();

    // Upsert - replace if same date
    const { data: log, error } = await supabase
      .from('weight_logs')
      .upsert({
        user_id: auth.user.id,
        weight_value,
        weight_unit,
        logged_at: date,
      }, { onConflict: 'user_id,logged_at' })
      .select()
      .single();

    if (error) {
      console.error('Weight log error:', error);
      return serverError('Failed to log weight');
    }

    return created({ log });
  } catch (error) {
    console.error('Weight log error:', error);
    return serverError('Failed to log weight');
  }
}
