import { createClient } from '@/lib/supabase/client';
import type {
  Meal,
  MealItem,
  MealWithItems,
  CreateMealInput,
  UpdateMealInput,
  CreateMealItemInput,
  UpdateMealItemInput,
  DailySummary,
} from './types';
import { calculateMealTotals, calculateDailySummary, getDayBoundaries } from './service';

// ============================================
// TYPES
// ============================================

export interface MealRepository {
  getMealsForDate(userId: string, date: Date): Promise<MealWithItems[]>;
  getMealById(id: string): Promise<MealWithItems | null>;
  createMeal(data: CreateMealInput): Promise<Meal>;
  updateMeal(id: string, data: UpdateMealInput): Promise<Meal>;
  deleteMeal(id: string): Promise<void>;
  addMealItem(mealId: string, item: CreateMealItemInput): Promise<MealItem>;
  updateMealItem(itemId: string, data: UpdateMealItemInput): Promise<MealItem>;
  removeMealItem(itemId: string): Promise<void>;
  getDailySummary(userId: string, date: Date, calorieTarget?: number | null): Promise<DailySummary>;
  recalculateMealTotals(mealId: string): Promise<void>;
}

// ============================================
// REPOSITORY IMPLEMENTATION
// ============================================

export function createMealRepository(): MealRepository {
  const supabase = createClient();

  return {
    async getMealsForDate(userId: string, date: Date): Promise<MealWithItems[]> {
      const { start, end } = getDayBoundaries(date);

      const { data: meals, error: mealsError } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .gte('logged_at', start)
        .lte('logged_at', end)
        .order('logged_at', { ascending: true });

      if (mealsError) {
        throw new Error(`Failed to get meals: ${mealsError.message}`);
      }

      if (!meals || meals.length === 0) {
        return [];
      }

      // Fetch all meal items for these meals
      const mealIds = meals.map(m => m.id);
      const { data: items, error: itemsError } = await supabase
        .from('meal_items')
        .select('*')
        .in('meal_id', mealIds);

      if (itemsError) {
        throw new Error(`Failed to get meal items: ${itemsError.message}`);
      }

      // Group items by meal_id
      const itemsByMealId = (items || []).reduce((acc, item) => {
        if (!acc[item.meal_id]) {
          acc[item.meal_id] = [];
        }
        acc[item.meal_id].push(item as MealItem);
        return acc;
      }, {} as Record<string, MealItem[]>);

      // Combine meals with their items
      return meals.map(meal => ({
        ...meal,
        items: itemsByMealId[meal.id] || [],
      } as MealWithItems));
    },

    async getMealById(id: string): Promise<MealWithItems | null> {
      const { data: meal, error: mealError } = await supabase
        .from('meals')
        .select('*')
        .eq('id', id)
        .single();

      if (mealError) {
        if (mealError.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to get meal: ${mealError.message}`);
      }

      const { data: items, error: itemsError } = await supabase
        .from('meal_items')
        .select('*')
        .eq('meal_id', id);

      if (itemsError) {
        throw new Error(`Failed to get meal items: ${itemsError.message}`);
      }

      return {
        ...meal,
        items: (items || []) as MealItem[],
      } as MealWithItems;
    },

    async createMeal(input: CreateMealInput): Promise<Meal> {
      const { data, error } = await supabase
        .from('meals')
        .insert({
          user_id: input.user_id,
          meal_type: input.meal_type ?? null,
          logged_at: input.logged_at ?? new Date().toISOString(),
          notes: input.notes ?? null,
          total_calories: 0,
          total_protein: 0,
          total_carbs: 0,
          total_fat: 0,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create meal: ${error.message}`);
      }

      return data as Meal;
    },

    async updateMeal(id: string, input: UpdateMealInput): Promise<Meal> {
      const { data, error } = await supabase
        .from('meals')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update meal: ${error.message}`);
      }

      return data as Meal;
    },

    async deleteMeal(id: string): Promise<void> {
      // Items will be cascade deleted by database
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete meal: ${error.message}`);
      }
    },

    async addMealItem(mealId: string, item: CreateMealItemInput): Promise<MealItem> {
      const { data, error } = await supabase
        .from('meal_items')
        .insert({
          meal_id: item.meal_id,
          food_id: item.food_id,
          quantity: item.quantity,
          unit: item.unit,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add meal item: ${error.message}`);
      }

      // Update meal totals
      await this.recalculateMealTotals(mealId);

      return data as MealItem;
    },

    async updateMealItem(itemId: string, input: UpdateMealItemInput): Promise<MealItem> {
      const { data, error } = await supabase
        .from('meal_items')
        .update(input)
        .eq('id', itemId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update meal item: ${error.message}`);
      }

      // Update meal totals
      const mealItem = data as MealItem;
      await this.recalculateMealTotals(mealItem.meal_id);

      return mealItem;
    },

    async removeMealItem(itemId: string): Promise<void> {
      // Get meal_id before deleting
      const { data: item, error: fetchError } = await supabase
        .from('meal_items')
        .select('meal_id')
        .eq('id', itemId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch meal item: ${fetchError.message}`);
      }

      const { error } = await supabase
        .from('meal_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        throw new Error(`Failed to remove meal item: ${error.message}`);
      }

      // Update meal totals
      if (item) {
        await this.recalculateMealTotals(item.meal_id);
      }
    },

    async getDailySummary(
      userId: string,
      date: Date,
      calorieTarget: number | null = null
    ): Promise<DailySummary> {
      const meals = await this.getMealsForDate(userId, date);
      const dateString = date.toISOString().split('T')[0]!;

      return calculateDailySummary(meals, calorieTarget, dateString);
    },

    // Helper method to recalculate meal totals
    async recalculateMealTotals(mealId: string): Promise<void> {
      const { data: items, error } = await supabase
        .from('meal_items')
        .select('*')
        .eq('meal_id', mealId);

      if (error) {
        throw new Error(`Failed to fetch meal items for recalculation: ${error.message}`);
      }

      const totals = calculateMealTotals((items || []) as MealItem[]);

      const { error: updateError } = await supabase
        .from('meals')
        .update({
          total_calories: totals.total_calories,
          total_protein: totals.total_protein,
          total_carbs: totals.total_carbs,
          total_fat: totals.total_fat,
          updated_at: new Date().toISOString(),
        })
        .eq('id', mealId);

      if (updateError) {
        throw new Error(`Failed to update meal totals: ${updateError.message}`);
      }
    },
  };
}

// ============================================
// SERVER REPOSITORY (for API routes)
// ============================================

export async function createServerMealRepository() {
  const { createClient: createServerClient } = await import('@/lib/supabase/server');
  const supabase = await createServerClient();

  // Same implementation but with server client
  return {
    async getMealsForDate(userId: string, date: Date): Promise<MealWithItems[]> {
      const { start, end } = getDayBoundaries(date);

      const { data: meals, error: mealsError } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .gte('logged_at', start)
        .lte('logged_at', end)
        .order('logged_at', { ascending: true });

      if (mealsError) {
        throw new Error(`Failed to get meals: ${mealsError.message}`);
      }

      if (!meals || meals.length === 0) {
        return [];
      }

      const mealIds = meals.map(m => m.id);
      const { data: items, error: itemsError } = await supabase
        .from('meal_items')
        .select('*')
        .in('meal_id', mealIds);

      if (itemsError) {
        throw new Error(`Failed to get meal items: ${itemsError.message}`);
      }

      const itemsByMealId = (items || []).reduce((acc, item) => {
        if (!acc[item.meal_id]) {
          acc[item.meal_id] = [];
        }
        acc[item.meal_id].push(item as MealItem);
        return acc;
      }, {} as Record<string, MealItem[]>);

      return meals.map(meal => ({
        ...meal,
        items: itemsByMealId[meal.id] || [],
      } as MealWithItems));
    },

    async getMealById(id: string): Promise<MealWithItems | null> {
      const { data: meal, error: mealError } = await supabase
        .from('meals')
        .select('*')
        .eq('id', id)
        .single();

      if (mealError) {
        if (mealError.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to get meal: ${mealError.message}`);
      }

      const { data: items, error: itemsError } = await supabase
        .from('meal_items')
        .select('*')
        .eq('meal_id', id);

      if (itemsError) {
        throw new Error(`Failed to get meal items: ${itemsError.message}`);
      }

      return {
        ...meal,
        items: (items || []) as MealItem[],
      } as MealWithItems;
    },

    async getDailySummary(
      userId: string,
      date: Date,
      calorieTarget: number | null = null
    ): Promise<DailySummary> {
      const { start, end } = getDayBoundaries(date);

      const { data: meals, error: mealsError } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .gte('logged_at', start)
        .lte('logged_at', end);

      if (mealsError) {
        throw new Error(`Failed to get meals: ${mealsError.message}`);
      }

      if (!meals || meals.length === 0) {
        const dateString = date.toISOString().split('T')[0]!;
        return calculateDailySummary([], calorieTarget, dateString);
      }

      const mealIds = meals.map(m => m.id);
      const { data: items, error: itemsError } = await supabase
        .from('meal_items')
        .select('*')
        .in('meal_id', mealIds);

      if (itemsError) {
        throw new Error(`Failed to get meal items: ${itemsError.message}`);
      }

      const itemsByMealId = (items || []).reduce((acc, item) => {
        if (!acc[item.meal_id]) {
          acc[item.meal_id] = [];
        }
        acc[item.meal_id].push(item as MealItem);
        return acc;
      }, {} as Record<string, MealItem[]>);

      const mealsWithItems = meals.map(meal => ({
        ...meal,
        items: itemsByMealId[meal.id] || [],
      } as MealWithItems));

      const dateString = date.toISOString().split('T')[0]!;
      return calculateDailySummary(mealsWithItems, calorieTarget, dateString);
    },
  };
}
