import { createClient } from '@/lib/supabase/client';
import type {
  Food,
  FoodServingUnit,
  CreateFoodInput,
  UpdateFoodInput,
  SearchFoodsOptions,
} from './types';
import { calculateCaloriesFromMacros } from './service';

// ============================================
// TYPES
// ============================================

export interface FoodRepository {
  searchFoods(query: string, options?: SearchFoodsOptions): Promise<Food[]>;
  getFoodById(id: string): Promise<Food | null>;
  createFood(data: CreateFoodInput): Promise<Food>;
  updateFood(id: string, data: UpdateFoodInput): Promise<Food>;
  deleteFood(id: string): Promise<void>;
  getFoodServingUnits(foodId: string): Promise<FoodServingUnit[]>;
  getRecentFoods(userId: string, limit?: number): Promise<Food[]>;
}

// ============================================
// REPOSITORY IMPLEMENTATION
// ============================================

export function createFoodRepository(): FoodRepository {
  const supabase = createClient();

  return {
    async searchFoods(
      query: string,
      options: SearchFoodsOptions = {}
    ): Promise<Food[]> {
      const {
        limit = 20,
        offset = 0,
        source,
        userId,
        includePublic = true,
      } = options;

      let queryBuilder = supabase
        .from('foods')
        .select('*')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1);

      // Apply source filter if specified
      if (source) {
        queryBuilder = queryBuilder.eq('source', source);
      }

      // Priority: user's foods > public foods > USDA
      // Build the filter to get user's own foods and optionally public foods
      if (userId) {
        if (includePublic) {
          // Get user's own foods OR public foods
          queryBuilder = queryBuilder.or(`created_by.eq.${userId},is_public.eq.true`);
        } else {
          // Get only user's own foods
          queryBuilder = queryBuilder.eq('created_by', userId);
        }
      } else if (includePublic) {
        // No user specified, get only public foods
        queryBuilder = queryBuilder.eq('is_public', true);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        throw new Error(`Failed to search foods: ${error.message}`);
      }

      // Sort results by priority: user foods first, then public, then USDA
      const sortedData = (data || []).sort((a, b) => {
        if (userId) {
          const aIsUserFood = a.created_by === userId;
          const bIsUserFood = b.created_by === userId;
          if (aIsUserFood && !bIsUserFood) return -1;
          if (!aIsUserFood && bIsUserFood) return 1;
        }

        // Then by source priority
        const sourcePriority: Record<string, number> = { user: 1, ai_generated: 2, usda: 3 };
        return (sourcePriority[a.source] ?? 3) - (sourcePriority[b.source] ?? 3);
      });

      return sortedData as Food[];
    },

    async getFoodById(id: string): Promise<Food | null> {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw new Error(`Failed to get food: ${error.message}`);
      }

      return data as Food;
    },

    async createFood(input: CreateFoodInput): Promise<Food> {
      // Calculate calories from macros
      const calories = calculateCaloriesFromMacros(
        input.protein_per_100g,
        input.carbs_per_100g,
        input.fat_per_100g
      );

      const { data, error } = await supabase
        .from('foods')
        .insert({
          ...input,
          calories_per_100g: calories,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create food: ${error.message}`);
      }

      return data as Food;
    },

    async updateFood(id: string, input: UpdateFoodInput): Promise<Food> {
      // Recalculate calories if any macros are being updated
      const updateData: any = { ...input };

      if (
        input.protein_per_100g !== undefined ||
        input.carbs_per_100g !== undefined ||
        input.fat_per_100g !== undefined
      ) {
        // Get current food data to fill in missing values
        const current = await supabase
          .from('foods')
          .select('protein_per_100g, carbs_per_100g, fat_per_100g')
          .eq('id', id)
          .single();

        if (current.error) {
          throw new Error(`Failed to get current food data: ${current.error.message}`);
        }

        const protein = input.protein_per_100g ?? current.data.protein_per_100g;
        const carbs = input.carbs_per_100g ?? current.data.carbs_per_100g;
        const fat = input.fat_per_100g ?? current.data.fat_per_100g;

        updateData.calories_per_100g = calculateCaloriesFromMacros(protein, carbs, fat);
      }

      const { data, error } = await supabase
        .from('foods')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update food: ${error.message}`);
      }

      return data as Food;
    },

    async deleteFood(id: string): Promise<void> {
      const { error } = await supabase
        .from('foods')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete food: ${error.message}`);
      }
    },

    async getFoodServingUnits(foodId: string): Promise<FoodServingUnit[]> {
      const { data, error } = await supabase
        .from('food_serving_units')
        .select('*')
        .eq('food_id', foodId)
        .order('is_default', { ascending: false })
        .order('unit_name', { ascending: true });

      if (error) {
        throw new Error(`Failed to get serving units: ${error.message}`);
      }

      return (data || []) as FoodServingUnit[];
    },

    async getRecentFoods(userId: string, limit = 10): Promise<Food[]> {
      // Get recently logged foods from meal_items
      const { data: recentItems, error: itemsError } = await supabase
        .from('meal_items')
        .select('food_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit * 2); // Get more than needed to account for duplicates

      if (itemsError) {
        throw new Error(`Failed to get recent foods: ${itemsError.message}`);
      }

      if (!recentItems || recentItems.length === 0) {
        return [];
      }

      // Get unique food IDs while maintaining order
      const uniqueFoodIds = Array.from(
        new Set(recentItems.map((item) => item.food_id))
      ).slice(0, limit);

      // Fetch the food details
      const { data: foods, error: foodsError } = await supabase
        .from('foods')
        .select('*')
        .in('id', uniqueFoodIds);

      if (foodsError) {
        throw new Error(`Failed to get food details: ${foodsError.message}`);
      }

      // Sort foods to match the order of uniqueFoodIds (most recent first)
      const sortedFoods = uniqueFoodIds
        .map((id) => foods?.find((f) => f.id === id))
        .filter((f): f is Food => f !== undefined);

      return sortedFoods;
    },
  };
}

// ============================================
// SERVER REPOSITORY (for API routes)
// ============================================

export async function createServerFoodRepository() {
  const { createClient: createServerClient } = await import('@/lib/supabase/server');
  const supabase = await createServerClient();

  // Same implementation as client repository but with server client
  return {
    async searchFoods(
      query: string,
      options: SearchFoodsOptions = {}
    ): Promise<Food[]> {
      const {
        limit = 20,
        offset = 0,
        source,
        userId,
        includePublic = true,
      } = options;

      let queryBuilder = supabase
        .from('foods')
        .select('*')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1);

      if (source) {
        queryBuilder = queryBuilder.eq('source', source);
      }

      if (userId) {
        if (includePublic) {
          queryBuilder = queryBuilder.or(`created_by.eq.${userId},is_public.eq.true`);
        } else {
          queryBuilder = queryBuilder.eq('created_by', userId);
        }
      } else if (includePublic) {
        queryBuilder = queryBuilder.eq('is_public', true);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        throw new Error(`Failed to search foods: ${error.message}`);
      }

      const sortedData = (data || []).sort((a, b) => {
        if (userId) {
          const aIsUserFood = a.created_by === userId;
          const bIsUserFood = b.created_by === userId;
          if (aIsUserFood && !bIsUserFood) return -1;
          if (!aIsUserFood && bIsUserFood) return 1;
        }

        const sourcePriority: Record<string, number> = { user: 1, ai_generated: 2, usda: 3 };
        return (sourcePriority[a.source] ?? 3) - (sourcePriority[b.source] ?? 3);
      });

      return sortedData as Food[];
    },

    async getFoodById(id: string): Promise<Food | null> {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to get food: ${error.message}`);
      }

      return data as Food;
    },

    async createFood(input: CreateFoodInput): Promise<Food> {
      const calories = calculateCaloriesFromMacros(
        input.protein_per_100g,
        input.carbs_per_100g,
        input.fat_per_100g
      );

      const { data, error } = await supabase
        .from('foods')
        .insert({
          ...input,
          calories_per_100g: calories,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create food: ${error.message}`);
      }

      return data as Food;
    },

    async updateFood(id: string, input: UpdateFoodInput): Promise<Food> {
      const updateData: any = { ...input };

      if (
        input.protein_per_100g !== undefined ||
        input.carbs_per_100g !== undefined ||
        input.fat_per_100g !== undefined
      ) {
        const current = await supabase
          .from('foods')
          .select('protein_per_100g, carbs_per_100g, fat_per_100g')
          .eq('id', id)
          .single();

        if (current.error) {
          throw new Error(`Failed to get current food data: ${current.error.message}`);
        }

        const protein = input.protein_per_100g ?? current.data.protein_per_100g;
        const carbs = input.carbs_per_100g ?? current.data.carbs_per_100g;
        const fat = input.fat_per_100g ?? current.data.fat_per_100g;

        updateData.calories_per_100g = calculateCaloriesFromMacros(protein, carbs, fat);
      }

      const { data, error } = await supabase
        .from('foods')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update food: ${error.message}`);
      }

      return data as Food;
    },

    async deleteFood(id: string): Promise<void> {
      const { error } = await supabase
        .from('foods')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete food: ${error.message}`);
      }
    },

    async getFoodServingUnits(foodId: string): Promise<FoodServingUnit[]> {
      const { data, error } = await supabase
        .from('food_serving_units')
        .select('*')
        .eq('food_id', foodId)
        .order('is_default', { ascending: false })
        .order('unit_name', { ascending: true });

      if (error) {
        throw new Error(`Failed to get serving units: ${error.message}`);
      }

      return (data || []) as FoodServingUnit[];
    },

    async getRecentFoods(userId: string, limit = 10): Promise<Food[]> {
      const { data: recentItems, error: itemsError } = await supabase
        .from('meal_items')
        .select('food_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit * 2);

      if (itemsError) {
        throw new Error(`Failed to get recent foods: ${itemsError.message}`);
      }

      if (!recentItems || recentItems.length === 0) {
        return [];
      }

      const uniqueFoodIds = Array.from(
        new Set(recentItems.map((item) => item.food_id))
      ).slice(0, limit);

      const { data: foods, error: foodsError } = await supabase
        .from('foods')
        .select('*')
        .in('id', uniqueFoodIds);

      if (foodsError) {
        throw new Error(`Failed to get food details: ${foodsError.message}`);
      }

      const sortedFoods = uniqueFoodIds
        .map((id) => foods?.find((f) => f.id === id))
        .filter((f): f is Food => f !== undefined);

      return sortedFoods;
    },
  };
}
