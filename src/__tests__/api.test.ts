import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

describe('API Integration Tests', () => {
  let supabase: ReturnType<typeof createClient<Database>>;
  let testUserId: string;
  let testEmail: string;

  beforeAll(() => {
    supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
  });

  beforeEach(() => {
    testEmail = `test-${Date.now()}@example.com`;
  });

  afterAll(async () => {
    // Cleanup test user if exists
    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId);
    }
  });

  describe('Authentication Flow', () => {
    it('should sign up a new user', async () => {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'Test123!@#',
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(testEmail);

      testUserId = data.user!.id;
    });

    it('should sign in an existing user', async () => {
      // First create user
      await supabase.auth.signUp({
        email: testEmail,
        password: 'Test123!@#',
      });

      // Then sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: 'Test123!@#',
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.session).toBeDefined();
    });

    it('should fail with invalid credentials', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      });

      expect(error).toBeDefined();
      expect(data.user).toBeNull();
    });

    it('should sign out user', async () => {
      // Create and sign in
      const { data: signUpData } = await supabase.auth.signUp({
        email: testEmail,
        password: 'Test123!@#',
      });

      // Sign out
      const { error } = await supabase.auth.signOut();

      expect(error).toBeNull();
    });
  });

  describe('Meal CRUD Operations', () => {
    beforeEach(async () => {
      // Create test user for meal operations
      const { data } = await supabase.auth.signUp({
        email: testEmail,
        password: 'Test123!@#',
      });
      testUserId = data.user!.id;
    });

    it('should create a new meal', async () => {
      const mealData = {
        user_id: testUserId,
        name: 'Test Breakfast',
        description: 'Oatmeal with berries',
        calories: 350,
        protein: 12,
        carbs: 58,
        fat: 8,
        meal_type: 'breakfast' as const,
        consumed_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('meals')
        .insert(mealData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.name).toBe(mealData.name);
      expect(data.calories).toBe(mealData.calories);
    });

    it('should retrieve user meals', async () => {
      // Insert test meals
      await supabase.from('meals').insert([
        {
          user_id: testUserId,
          name: 'Breakfast',
          calories: 350,
          protein: 12,
          carbs: 58,
          fat: 8,
          meal_type: 'breakfast',
          consumed_at: new Date().toISOString(),
        },
        {
          user_id: testUserId,
          name: 'Lunch',
          calories: 600,
          protein: 35,
          carbs: 50,
          fat: 20,
          meal_type: 'lunch',
          consumed_at: new Date().toISOString(),
        },
      ]);

      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', testUserId)
        .order('consumed_at', { ascending: false });

      expect(error).toBeNull();
      expect(data).toHaveLength(2);
      expect(data[0].name).toBe('Lunch');
    });

    it('should update a meal', async () => {
      // Create meal
      const { data: meal } = await supabase
        .from('meals')
        .insert({
          user_id: testUserId,
          name: 'Original Meal',
          calories: 500,
          protein: 25,
          carbs: 50,
          fat: 15,
          meal_type: 'lunch',
          consumed_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Update meal
      const { data, error } = await supabase
        .from('meals')
        .update({ name: 'Updated Meal', calories: 550 })
        .eq('id', meal!.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.name).toBe('Updated Meal');
      expect(data.calories).toBe(550);
    });

    it('should delete a meal', async () => {
      // Create meal
      const { data: meal } = await supabase
        .from('meals')
        .insert({
          user_id: testUserId,
          name: 'Meal to Delete',
          calories: 400,
          protein: 20,
          carbs: 40,
          fat: 12,
          meal_type: 'snack',
          consumed_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Delete meal
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', meal!.id);

      expect(error).toBeNull();

      // Verify deletion
      const { data: deletedMeal } = await supabase
        .from('meals')
        .select()
        .eq('id', meal!.id)
        .single();

      expect(deletedMeal).toBeNull();
    });
  });

  describe('Weight Logging', () => {
    beforeEach(async () => {
      const { data } = await supabase.auth.signUp({
        email: testEmail,
        password: 'Test123!@#',
      });
      testUserId = data.user!.id;
    });

    it('should log weight entry', async () => {
      const weightData = {
        user_id: testUserId,
        weight: 75.5,
        measured_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('weight_logs')
        .insert(weightData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.weight).toBe(weightData.weight);
    });

    it('should retrieve weight history', async () => {
      // Insert multiple weight entries
      const now = new Date();
      await supabase.from('weight_logs').insert([
        {
          user_id: testUserId,
          weight: 76,
          measured_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          user_id: testUserId,
          weight: 75.5,
          measured_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          user_id: testUserId,
          weight: 75,
          measured_at: now.toISOString(),
        },
      ]);

      const { data, error } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', testUserId)
        .order('measured_at', { ascending: false });

      expect(error).toBeNull();
      expect(data).toHaveLength(3);
      expect(data[0].weight).toBe(75); // Most recent
    });

    it('should calculate weight change', async () => {
      const now = new Date();
      await supabase.from('weight_logs').insert([
        {
          user_id: testUserId,
          weight: 80,
          measured_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          user_id: testUserId,
          weight: 75,
          measured_at: now.toISOString(),
        },
      ]);

      const { data } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', testUserId)
        .order('measured_at', { ascending: true });

      const weightChange = data![data!.length - 1].weight - data![0].weight;
      expect(weightChange).toBe(-5);
    });
  });

  describe('User Profile', () => {
    beforeEach(async () => {
      const { data } = await supabase.auth.signUp({
        email: testEmail,
        password: 'Test123!@#',
      });
      testUserId = data.user!.id;
    });

    it('should create user profile', async () => {
      const profileData = {
        user_id: testUserId,
        age: 30,
        gender: 'male' as const,
        height: 175,
        activity_level: 'moderate' as const,
        goal: 'lose_weight' as const,
        target_weight: 70,
        daily_calorie_goal: 2000,
        daily_protein_goal: 150,
        daily_carbs_goal: 200,
        daily_fat_goal: 65,
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.age).toBe(profileData.age);
      expect(data.daily_calorie_goal).toBe(profileData.daily_calorie_goal);
    });

    it('should update user profile', async () => {
      // Create profile
      await supabase.from('profiles').insert({
        user_id: testUserId,
        age: 30,
        gender: 'male',
        height: 175,
        activity_level: 'moderate',
        goal: 'lose_weight',
        daily_calorie_goal: 2000,
      });

      // Update profile
      const { data, error } = await supabase
        .from('profiles')
        .update({ daily_calorie_goal: 1800, goal: 'maintain' })
        .eq('user_id', testUserId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.daily_calorie_goal).toBe(1800);
      expect(data.goal).toBe('maintain');
    });
  });
});
