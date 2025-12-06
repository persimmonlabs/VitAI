import { createClient } from '@/lib/supabase/server';
import { success, serverError } from '@/lib/api/response';
import { getAuthenticatedUser } from '@/lib/api/auth';

// GET /api/summary/today
export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth.success) return auth.response;

  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    // Get user's calorie target
    const { data: profile } = await supabase
      .from('users_profile')
      .select('daily_calorie_target, protein_target_g, carbs_target_g, fat_target_g')
      .eq('id', auth.user.id)
      .single();

    // Get today's meals with totals
    const startOfDay = new Date(today!);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today!);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: meals } = await supabase
      .from('meals')
      .select('total_calories, total_protein, total_carbs, total_fat, meal_type')
      .eq('user_id', auth.user.id)
      .gte('logged_at', startOfDay.toISOString())
      .lte('logged_at', endOfDay.toISOString());

    // Calculate totals
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      meal_count: 0,
    };

    const mealTypeCounts: Record<string, number> = {};

    meals?.forEach((meal) => {
      totals.calories += Number(meal.total_calories) || 0;
      totals.protein += Number(meal.total_protein) || 0;
      totals.carbs += Number(meal.total_carbs) || 0;
      totals.fat += Number(meal.total_fat) || 0;
      totals.meal_count++;

      if (meal.meal_type) {
        mealTypeCounts[meal.meal_type] = (mealTypeCounts[meal.meal_type] || 0) + 1;
      }
    });

    const targets = {
      calories: profile?.daily_calorie_target ?? 2000,
      protein: profile?.protein_target_g ?? 150,
      carbs: profile?.carbs_target_g ?? 200,
      fat: profile?.fat_target_g ?? 67,
    };

    const remaining = {
      calories: targets.calories - totals.calories,
      protein: targets.protein - totals.protein,
      carbs: targets.carbs - totals.carbs,
      fat: targets.fat - totals.fat,
    };

    const percentages = {
      calories: Math.min(100, Math.round((totals.calories / targets.calories) * 100)),
      protein: Math.min(100, Math.round((totals.protein / targets.protein) * 100)),
      carbs: Math.min(100, Math.round((totals.carbs / targets.carbs) * 100)),
      fat: Math.min(100, Math.round((totals.fat / targets.fat) * 100)),
    };

    return success({
      date: today,
      totals: {
        ...totals,
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fat: Math.round(totals.fat),
      },
      targets,
      remaining: {
        calories: Math.round(remaining.calories),
        protein: Math.round(remaining.protein),
        carbs: Math.round(remaining.carbs),
        fat: Math.round(remaining.fat),
      },
      percentages,
      meal_type_counts: mealTypeCounts,
    });
  } catch (error) {
    console.error('Summary fetch error:', error);
    return serverError('Failed to fetch summary');
  }
}
