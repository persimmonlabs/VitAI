import { createClient } from '@/lib/supabase/client';
import type {
  WeightLog,
  WeightGoal,
  CreateWeightLogInput,
  UpdateWeightLogInput,
  CreateGoalInput,
  UpdateGoalInput,
  GetWeightLogsOptions,
} from './types';

// ============================================
// TYPES
// ============================================

export interface WeightRepository {
  getWeightLogs(userId: string, options?: GetWeightLogsOptions): Promise<WeightLog[]>;
  getLatestWeight(userId: string): Promise<WeightLog | null>;
  logWeight(data: CreateWeightLogInput): Promise<WeightLog>;
  updateWeightLog(id: string, data: UpdateWeightLogInput): Promise<WeightLog>;
  deleteWeightLog(id: string): Promise<void>;
  getActiveGoal(userId: string): Promise<WeightGoal | null>;
  createGoal(data: CreateGoalInput): Promise<WeightGoal>;
  updateGoal(id: string, data: UpdateGoalInput): Promise<WeightGoal>;
  completeGoal(id: string): Promise<WeightGoal>;
  abandonGoal(id: string): Promise<WeightGoal>;
}

// ============================================
// REPOSITORY IMPLEMENTATION
// ============================================

export function createWeightRepository(): WeightRepository {
  const supabase = createClient();

  return {
    async getWeightLogs(
      userId: string,
      options?: GetWeightLogsOptions
    ): Promise<WeightLog[]> {
      let query = supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', userId);

      // Apply date filters
      if (options?.startDate) {
        query = query.gte('logged_at', options.startDate);
      }
      if (options?.endDate) {
        query = query.lte('logged_at', options.endDate);
      }

      // Apply ordering
      const orderBy = options?.orderBy ?? 'desc';
      query = query.order('logged_at', { ascending: orderBy === 'asc' });

      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get weight logs: ${error.message}`);
      }

      return (data as WeightLog[]) ?? [];
    },

    async getLatestWeight(userId: string): Promise<WeightLog | null> {
      const { data, error } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw new Error(`Failed to get latest weight: ${error.message}`);
      }

      return data as WeightLog;
    },

    async logWeight(input: CreateWeightLogInput): Promise<WeightLog> {
      const logged_at = input.logged_at ?? new Date().toISOString().split('T')[0]!;

      const { data, error } = await supabase
        .from('weight_logs')
        .insert({
          user_id: input.user_id,
          weight_value: input.weight_value,
          weight_unit: input.weight_unit,
          logged_at,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to log weight: ${error.message}`);
      }

      return data as WeightLog;
    },

    async updateWeightLog(
      id: string,
      input: UpdateWeightLogInput
    ): Promise<WeightLog> {
      const { data, error } = await supabase
        .from('weight_logs')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update weight log: ${error.message}`);
      }

      return data as WeightLog;
    },

    async deleteWeightLog(id: string): Promise<void> {
      const { error } = await supabase
        .from('weight_logs')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete weight log: ${error.message}`);
      }
    },

    async getActiveGoal(userId: string): Promise<WeightGoal | null> {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw new Error(`Failed to get active goal: ${error.message}`);
      }

      return data as WeightGoal;
    },

    async createGoal(input: CreateGoalInput): Promise<WeightGoal> {
      const start_date = input.start_date ?? new Date().toISOString().split('T')[0]!;

      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: input.user_id,
          goal_type: input.goal_type,
          target_weight: input.target_weight,
          target_weight_unit: input.target_weight_unit,
          target_date: input.target_date ?? null,
          start_weight: input.start_weight,
          start_date,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create goal: ${error.message}`);
      }

      return data as WeightGoal;
    },

    async updateGoal(id: string, input: UpdateGoalInput): Promise<WeightGoal> {
      const { data, error } = await supabase
        .from('goals')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update goal: ${error.message}`);
      }

      return data as WeightGoal;
    },

    async completeGoal(id: string): Promise<WeightGoal> {
      const { data, error } = await supabase
        .from('goals')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to complete goal: ${error.message}`);
      }

      return data as WeightGoal;
    },

    async abandonGoal(id: string): Promise<WeightGoal> {
      const { data, error } = await supabase
        .from('goals')
        .update({
          status: 'abandoned',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to abandon goal: ${error.message}`);
      }

      return data as WeightGoal;
    },
  };
}

// ============================================
// SERVER REPOSITORY (for API routes)
// ============================================

export async function createServerWeightRepository(): Promise<WeightRepository> {
  const { createClient: createServerClient } = await import('@/lib/supabase/server');
  const supabase = await createServerClient();

  return {
    async getWeightLogs(
      userId: string,
      options?: GetWeightLogsOptions
    ): Promise<WeightLog[]> {
      let query = supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', userId);

      if (options?.startDate) {
        query = query.gte('logged_at', options.startDate);
      }
      if (options?.endDate) {
        query = query.lte('logged_at', options.endDate);
      }

      const orderBy = options?.orderBy ?? 'desc';
      query = query.order('logged_at', { ascending: orderBy === 'asc' });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get weight logs: ${error.message}`);
      }

      return (data as WeightLog[]) ?? [];
    },

    async getLatestWeight(userId: string): Promise<WeightLog | null> {
      const { data, error } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to get latest weight: ${error.message}`);
      }

      return data as WeightLog;
    },

    async logWeight(input: CreateWeightLogInput): Promise<WeightLog> {
      const logged_at = input.logged_at ?? new Date().toISOString().split('T')[0]!;

      const { data, error } = await supabase
        .from('weight_logs')
        .insert({
          user_id: input.user_id,
          weight_value: input.weight_value,
          weight_unit: input.weight_unit,
          logged_at,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to log weight: ${error.message}`);
      }

      return data as WeightLog;
    },

    async updateWeightLog(
      id: string,
      input: UpdateWeightLogInput
    ): Promise<WeightLog> {
      const { data, error } = await supabase
        .from('weight_logs')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update weight log: ${error.message}`);
      }

      return data as WeightLog;
    },

    async deleteWeightLog(id: string): Promise<void> {
      const { error } = await supabase
        .from('weight_logs')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete weight log: ${error.message}`);
      }
    },

    async getActiveGoal(userId: string): Promise<WeightGoal | null> {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to get active goal: ${error.message}`);
      }

      return data as WeightGoal;
    },

    async createGoal(input: CreateGoalInput): Promise<WeightGoal> {
      const start_date = input.start_date ?? new Date().toISOString().split('T')[0]!;

      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: input.user_id,
          goal_type: input.goal_type,
          target_weight: input.target_weight,
          target_weight_unit: input.target_weight_unit,
          target_date: input.target_date ?? null,
          start_weight: input.start_weight,
          start_date,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create goal: ${error.message}`);
      }

      return data as WeightGoal;
    },

    async updateGoal(id: string, input: UpdateGoalInput): Promise<WeightGoal> {
      const { data, error } = await supabase
        .from('goals')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update goal: ${error.message}`);
      }

      return data as WeightGoal;
    },

    async completeGoal(id: string): Promise<WeightGoal> {
      const { data, error } = await supabase
        .from('goals')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to complete goal: ${error.message}`);
      }

      return data as WeightGoal;
    },

    async abandonGoal(id: string): Promise<WeightGoal> {
      const { data, error } = await supabase
        .from('goals')
        .update({
          status: 'abandoned',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to abandon goal: ${error.message}`);
      }

      return data as WeightGoal;
    },
  };
}
