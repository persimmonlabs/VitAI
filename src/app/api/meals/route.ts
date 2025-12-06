import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { success, created, badRequest, serverError } from '@/lib/api/response';
import { getAuthenticatedUser } from '@/lib/api/auth';
import { validateBody } from '@/lib/api/validation';

// GET /api/meals?date=YYYY-MM-DD
export async function GET(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth.success) return auth.response;

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date') ?? new Date().toISOString().split('T')[0]!;

  try {
    const supabase = await createClient();

    const startOfDay = new Date(dateParam);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateParam);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: meals, error } = await supabase
      .from('meals')
      .select(`
        *,
        meal_items (
          *,
          food:foods (*)
        )
      `)
      .eq('user_id', auth.user.id)
      .gte('logged_at', startOfDay.toISOString())
      .lte('logged_at', endOfDay.toISOString())
      .order('logged_at', { ascending: true });

    if (error) {
      console.error('Meals fetch error:', error);
      return serverError('Failed to fetch meals');
    }

    return success({ meals, date: dateParam });
  } catch (error) {
    console.error('Meals fetch error:', error);
    return serverError('Failed to fetch meals');
  }
}

const createMealSchema = z.object({
  meal_type: z.enum([
    'breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'
  ]).nullable().optional(),
  logged_at: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
  items: z.array(z.object({
    food_id: z.string().uuid(),
    quantity: z.number().positive(),
    unit: z.string(),
  })).min(1, 'At least one item is required'),
});

// POST /api/meals
export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth.success) return auth.response;

  const validation = await validateBody(request, createMealSchema);
  if (!validation.success) return validation.response;

  const { meal_type, logged_at, notes, items } = validation.data;

  try {
    const supabase = await createClient();

    // Get food data for all items to calculate nutrition
    const foodIds = items.map((item) => item.food_id);
    const { data: foods, error: foodsError } = await supabase
      .from('foods')
      .select('id, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g')
      .in('id', foodIds);

    if (foodsError || !foods) {
      return badRequest('One or more foods not found');
    }

    const foodMap = new Map(foods.map((f) => [f.id, f]));

    // Get serving unit conversions
    const { data: servingUnits } = await supabase
      .from('food_serving_units')
      .select('food_id, unit_name, grams_equivalent')
      .in('food_id', foodIds);

    const servingMap = new Map<string, Map<string, number>>();
    servingUnits?.forEach((su) => {
      if (!servingMap.has(su.food_id)) {
        servingMap.set(su.food_id, new Map());
      }
      servingMap.get(su.food_id)!.set(su.unit_name, su.grams_equivalent);
    });

    // Create meal
    const { data: meal, error: mealError } = await supabase
      .from('meals')
      .insert({
        user_id: auth.user.id,
        meal_type: meal_type ?? null,
        logged_at: logged_at ?? new Date().toISOString(),
        notes,
      })
      .select()
      .single();

    if (mealError || !meal) {
      console.error('Meal creation error:', mealError);
      return serverError('Failed to create meal');
    }

    // Calculate and create meal items
    const mealItems = items.map((item) => {
      const food = foodMap.get(item.food_id);
      if (!food) throw new Error(`Food ${item.food_id} not found`);

      // Get grams equivalent for the unit
      let grams = item.quantity; // Default assumes grams
      if (item.unit !== 'g') {
        const foodServings = servingMap.get(item.food_id);
        const gramsEquivalent = foodServings?.get(item.unit);
        if (gramsEquivalent) {
          grams = item.quantity * gramsEquivalent;
        }
      }

      // Calculate nutrition based on grams
      const multiplier = grams / 100;

      return {
        meal_id: meal.id,
        food_id: item.food_id,
        quantity: item.quantity,
        unit: item.unit,
        calories: Math.round(food.calories_per_100g * multiplier * 10) / 10,
        protein: Math.round(food.protein_per_100g * multiplier * 10) / 10,
        carbs: Math.round(food.carbs_per_100g * multiplier * 10) / 10,
        fat: Math.round(food.fat_per_100g * multiplier * 10) / 10,
      };
    });

    const { error: itemsError } = await supabase
      .from('meal_items')
      .insert(mealItems);

    if (itemsError) {
      console.error('Meal items creation error:', itemsError);
      // Delete the meal if items failed
      await supabase.from('meals').delete().eq('id', meal.id);
      return serverError('Failed to create meal items');
    }

    // Fetch the complete meal with items
    const { data: completeMeal } = await supabase
      .from('meals')
      .select(`
        *,
        meal_items (
          *,
          food:foods (*)
        )
      `)
      .eq('id', meal.id)
      .single();

    return created({ meal: completeMeal });
  } catch (error) {
    console.error('Meal creation error:', error);
    return serverError('Failed to create meal');
  }
}
