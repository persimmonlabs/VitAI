import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================
// QUERY KEYS
// ============================================

export const queryKeys = {
  // User
  user: ['user'] as const,
  userProfile: (userId: string) => ['user', userId, 'profile'] as const,

  // Meals
  meals: ['meals'] as const,
  mealsToday: () => ['meals', 'today'] as const,
  mealsByDate: (date: string) => ['meals', 'date', date] as const,
  meal: (id: string) => ['meals', id] as const,

  // Foods
  foods: ['foods'] as const,
  foodSearch: (query: string) => ['foods', 'search', query] as const,
  food: (id: string) => ['foods', id] as const,
  recentFoods: () => ['foods', 'recent'] as const,

  // Weight
  weight: ['weight'] as const,
  weightLogs: (range: string) => ['weight', 'logs', range] as const,
  weightLog: (id: string) => ['weight', id] as const,

  // Summary
  summary: ['summary'] as const,
  summaryToday: () => ['summary', 'today'] as const,
  summaryDate: (date: string) => ['summary', date] as const,

  // Goals
  goals: ['goals'] as const,
  activeGoal: () => ['goals', 'active'] as const,
};

// ============================================
// API FETCHERS
// ============================================

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'An error occurred');
  }

  return response.json();
}

// ============================================
// SUMMARY HOOKS
// ============================================

export function useTodaySummary() {
  return useQuery({
    queryKey: queryKeys.summaryToday(),
    queryFn: () => fetchAPI('/summary/today'),
  });
}

// ============================================
// MEAL HOOKS
// ============================================

export function useMeals(date: string) {
  return useQuery({
    queryKey: queryKeys.mealsByDate(date),
    queryFn: () => fetchAPI(`/meals?date=${date}`),
  });
}

export function useMeal(id: string) {
  return useQuery({
    queryKey: queryKeys.meal(id),
    queryFn: () => fetchAPI(`/meals/${id}`),
    enabled: !!id,
  });
}

export function useCreateMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: unknown) =>
      fetchAPI('/meals', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meals });
      queryClient.invalidateQueries({ queryKey: queryKeys.summary });
    },
  });
}

export function useUpdateMeal(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: unknown) =>
      fetchAPI(`/meals/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meals });
      queryClient.invalidateQueries({ queryKey: queryKeys.meal(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.summary });
    },
  });
}

export function useDeleteMeal(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      fetchAPI(`/meals/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meals });
      queryClient.invalidateQueries({ queryKey: queryKeys.summary });
    },
  });
}

// ============================================
// FOOD HOOKS
// ============================================

export function useFoodSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.foodSearch(query),
    queryFn: () => fetchAPI(`/foods?query=${encodeURIComponent(query)}`),
    enabled: query.length >= 2,
  });
}

export function useRecentFoods() {
  return useQuery({
    queryKey: queryKeys.recentFoods(),
    queryFn: () => fetchAPI('/foods?recent=true'),
  });
}

// ============================================
// WEIGHT HOOKS
// ============================================

export function useWeightLogs(range = '30d') {
  return useQuery({
    queryKey: queryKeys.weightLogs(range),
    queryFn: () => fetchAPI(`/weight?range=${range}`),
  });
}

export function useLogWeight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { weight_value: number; weight_unit: string; logged_at?: string }) =>
      fetchAPI('/weight', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.weight });
    },
  });
}

// ============================================
// USER HOOKS
// ============================================

export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => fetchAPI('/users/me'),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: unknown) =>
      fetchAPI('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: unknown) =>
      fetchAPI('/users/onboarding', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
  });
}

// ============================================
// AI HOOKS
// ============================================

export function useParseTextMeal() {
  return useMutation({
    mutationFn: (data: { text: string; language?: string }) =>
      fetchAPI('/ai/parse-text', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}

export function useParsePhotoMeal() {
  return useMutation({
    mutationFn: (data: { image_base64: string; language?: string }) =>
      fetchAPI('/ai/parse-photo', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}

// ============================================
// ALIASES for compatibility
// ============================================

// Meal mutation aliases
export const useUpdateMealMutation = useUpdateMeal;
export const useDeleteMealMutation = useDeleteMeal;
export const useCreateMealMutation = useCreateMeal;
export const useParseMealMutation = useParseTextMeal;

// Weight aliases
export const useCreateWeightLogMutation = useLogWeight;

// ============================================
// GOALS HOOKS
// ============================================

export function useGoals() {
  return useQuery({
    queryKey: queryKeys.goals,
    queryFn: () => fetchAPI('/goals'),
  });
}

export function useActiveGoal() {
  return useQuery({
    queryKey: queryKeys.activeGoal(),
    queryFn: () => fetchAPI('/goals/active'),
  });
}

export function useUpdateGoalsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: unknown) =>
      fetchAPI('/goals', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
  });
}
