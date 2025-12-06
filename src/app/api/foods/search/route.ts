import { createClient } from '@/lib/supabase/server';
import { success, serverError } from '@/lib/api/response';
import { getAuthenticatedUser } from '@/lib/api/auth';

// GET /api/foods/search?q=chicken&limit=10
export async function GET(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth.success) return auth.response;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50);

  if (!query || query.length < 2) {
    return success({ foods: [], query });
  }

  try {
    const supabase = await createClient();

    // Search with priority: user's foods > public > USDA
    // Using trigram similarity for fuzzy search
    const { data: foods, error } = await supabase
      .from('foods')
      .select(`
        *,
        serving_units:food_serving_units (*)
      `)
      .or(`is_public.eq.true,created_by.eq.${auth.user.id},source.eq.usda`)
      .ilike('name', `%${query}%`)
      .order('source', { ascending: true }) // USDA first, then user, then ai_generated
      .limit(limit);

    if (error) {
      console.error('Food search error:', error);
      return serverError('Failed to search foods');
    }

    // Sort to prioritize user's own foods
    const sortedFoods = foods?.sort((a, b) => {
      // User's own foods first
      if (a.created_by === auth.user.id && b.created_by !== auth.user.id) return -1;
      if (b.created_by === auth.user.id && a.created_by !== auth.user.id) return 1;

      // Then by source: usda > user > ai_generated
      const sourceOrder: Record<string, number> = { usda: 0, user: 1, ai_generated: 2 };
      return (sourceOrder[a.source] ?? 2) - (sourceOrder[b.source] ?? 2);
    });

    return success({ foods: sortedFoods, query, count: sortedFoods?.length ?? 0 });
  } catch (error) {
    console.error('Food search error:', error);
    return serverError('Failed to search foods');
  }
}
