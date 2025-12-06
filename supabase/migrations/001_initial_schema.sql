-- VitAI Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Complete schema for nutrition tracking MVP

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE activity_level AS ENUM (
  'sedentary',      -- Little or no exercise
  'light',          -- Light exercise 1-3 days/week
  'moderate',       -- Moderate exercise 3-5 days/week
  'active',         -- Hard exercise 6-7 days/week
  'very_active'     -- Very hard exercise, physical job
);

CREATE TYPE unit_system AS ENUM ('metric', 'imperial');

CREATE TYPE food_source AS ENUM ('usda', 'user', 'ai_generated');

CREATE TYPE meal_type AS ENUM (
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'pre_workout',
  'post_workout'
);

CREATE TYPE goal_type AS ENUM ('weight_loss', 'weight_gain', 'maintenance');

CREATE TYPE goal_status AS ENUM ('active', 'completed', 'abandoned');

CREATE TYPE weight_unit AS ENUM ('kg', 'lbs');

CREATE TYPE sex_type AS ENUM ('male', 'female');

-- ============================================
-- TABLES
-- ============================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  age INTEGER CHECK (age >= 13 AND age <= 120),
  sex sex_type,
  height_cm DECIMAL(5,2) CHECK (height_cm > 0 AND height_cm < 300),
  activity_level activity_level DEFAULT 'moderate',
  unit_system unit_system DEFAULT 'metric',
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'pt-BR')),
  daily_calorie_target INTEGER CHECK (daily_calorie_target >= 500 AND daily_calorie_target <= 10000),
  protein_target_g INTEGER,
  carbs_target_g INTEGER,
  fat_target_g INTEGER,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Foods table
CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT,
  -- Macros per 100g
  protein_per_100g DECIMAL(6,2) NOT NULL CHECK (protein_per_100g >= 0),
  carbs_per_100g DECIMAL(6,2) NOT NULL CHECK (carbs_per_100g >= 0),
  fat_per_100g DECIMAL(6,2) NOT NULL CHECK (fat_per_100g >= 0),
  fiber_per_100g DECIMAL(6,2) DEFAULT 0 CHECK (fiber_per_100g >= 0),
  sugar_per_100g DECIMAL(6,2) DEFAULT 0 CHECK (sugar_per_100g >= 0),
  sodium_mg_per_100g DECIMAL(8,2) DEFAULT 0 CHECK (sodium_mg_per_100g >= 0),
  -- Computed calories per 100g: protein*4 + carbs*4 + fat*9
  calories_per_100g DECIMAL(7,2) GENERATED ALWAYS AS (
    protein_per_100g * 4 + carbs_per_100g * 4 + fat_per_100g * 9
  ) STORED,
  -- Metadata
  source food_source NOT NULL DEFAULT 'user',
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Constraints
  CONSTRAINT fiber_lte_carbs CHECK (fiber_per_100g <= carbs_per_100g),
  CONSTRAINT sugar_lte_carbs CHECK (sugar_per_100g <= carbs_per_100g)
);

-- Food serving units (conversions)
CREATE TABLE food_serving_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_id UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  unit_name TEXT NOT NULL,
  grams_equivalent DECIMAL(8,2) NOT NULL CHECK (grams_equivalent > 0),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Each food can have one default unit
  UNIQUE (food_id, unit_name)
);

-- Meals
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_type meal_type, -- NULL allowed for untyped meals
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  -- Computed totals (updated via trigger)
  total_calories DECIMAL(8,2) DEFAULT 0,
  total_protein DECIMAL(7,2) DEFAULT 0,
  total_carbs DECIMAL(7,2) DEFAULT 0,
  total_fat DECIMAL(7,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meal items (foods within a meal)
CREATE TABLE meal_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  food_id UUID NOT NULL REFERENCES foods(id) ON DELETE RESTRICT,
  quantity DECIMAL(8,2) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL DEFAULT 'g',
  -- Computed values based on food + quantity
  calories DECIMAL(8,2) NOT NULL,
  protein DECIMAL(7,2) NOT NULL,
  carbs DECIMAL(7,2) NOT NULL,
  fat DECIMAL(7,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weight logs
CREATE TABLE weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_value DECIMAL(5,2) NOT NULL CHECK (weight_value > 0 AND weight_value < 1000),
  weight_unit weight_unit NOT NULL DEFAULT 'kg',
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- One weight log per day per user
  UNIQUE (user_id, logged_at)
);

-- Goals
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type goal_type NOT NULL,
  target_weight DECIMAL(5,2) CHECK (target_weight > 0 AND target_weight < 1000),
  target_weight_unit weight_unit DEFAULT 'kg',
  target_date DATE,
  start_weight DECIMAL(5,2) CHECK (start_weight > 0 AND start_weight < 1000),
  start_date DATE DEFAULT CURRENT_DATE,
  status goal_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Only one active goal per user at a time
  CONSTRAINT one_active_goal UNIQUE (user_id, status)
    DEFERRABLE INITIALLY DEFERRED
);

-- ============================================
-- INDEXES
-- ============================================

-- Foods indexes for search
CREATE INDEX idx_foods_name_trgm ON foods USING gin (name gin_trgm_ops);
CREATE INDEX idx_foods_source ON foods (source);
CREATE INDEX idx_foods_is_public ON foods (is_public) WHERE is_public = TRUE;
CREATE INDEX idx_foods_created_by ON foods (created_by);

-- Meals indexes
CREATE INDEX idx_meals_user_logged ON meals (user_id, logged_at DESC);
CREATE INDEX idx_meals_logged_at ON meals (logged_at);

-- Meal items indexes
CREATE INDEX idx_meal_items_meal ON meal_items (meal_id);
CREATE INDEX idx_meal_items_food ON meal_items (food_id);

-- Weight logs indexes
CREATE INDEX idx_weight_logs_user_date ON weight_logs (user_id, logged_at DESC);

-- Goals indexes
CREATE INDEX idx_goals_user_status ON goals (user_id, status);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Calculate meal totals from meal items
CREATE OR REPLACE FUNCTION calculate_meal_totals(p_meal_id UUID)
RETURNS TABLE (
  total_calories DECIMAL,
  total_protein DECIMAL,
  total_carbs DECIMAL,
  total_fat DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(mi.calories), 0)::DECIMAL,
    COALESCE(SUM(mi.protein), 0)::DECIMAL,
    COALESCE(SUM(mi.carbs), 0)::DECIMAL,
    COALESCE(SUM(mi.fat), 0)::DECIMAL
  FROM meal_items mi
  WHERE mi.meal_id = p_meal_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get daily nutrition summary
CREATE OR REPLACE FUNCTION get_daily_summary(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  date DATE,
  total_calories DECIMAL,
  total_protein DECIMAL,
  total_carbs DECIMAL,
  total_fat DECIMAL,
  meal_count INTEGER,
  calorie_target INTEGER,
  calorie_remaining DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH daily_totals AS (
    SELECT
      COALESCE(SUM(m.total_calories), 0) as cals,
      COALESCE(SUM(m.total_protein), 0) as protein,
      COALESCE(SUM(m.total_carbs), 0) as carbs,
      COALESCE(SUM(m.total_fat), 0) as fat,
      COUNT(m.id)::INTEGER as meals
    FROM meals m
    WHERE m.user_id = p_user_id
      AND DATE(m.logged_at) = p_date
  ),
  user_target AS (
    SELECT COALESCE(up.daily_calorie_target, 2000) as target
    FROM users_profile up
    WHERE up.id = p_user_id
  )
  SELECT
    p_date,
    dt.cals,
    dt.protein,
    dt.carbs,
    dt.fat,
    dt.meals,
    ut.target,
    (ut.target - dt.cals)::DECIMAL
  FROM daily_totals dt, user_target ut;
END;
$$ LANGUAGE plpgsql STABLE;

-- Update meal totals trigger function
CREATE OR REPLACE FUNCTION update_meal_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE meals
  SET
    total_calories = (SELECT COALESCE(SUM(calories), 0) FROM meal_items WHERE meal_id = COALESCE(NEW.meal_id, OLD.meal_id)),
    total_protein = (SELECT COALESCE(SUM(protein), 0) FROM meal_items WHERE meal_id = COALESCE(NEW.meal_id, OLD.meal_id)),
    total_carbs = (SELECT COALESCE(SUM(carbs), 0) FROM meal_items WHERE meal_id = COALESCE(NEW.meal_id, OLD.meal_id)),
    total_fat = (SELECT COALESCE(SUM(fat), 0) FROM meal_items WHERE meal_id = COALESCE(NEW.meal_id, OLD.meal_id)),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.meal_id, OLD.meal_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update meal totals when items change
CREATE TRIGGER trg_meal_items_update_totals
AFTER INSERT OR UPDATE OR DELETE ON meal_items
FOR EACH ROW
EXECUTE FUNCTION update_meal_totals();

-- Auto-update updated_at timestamps
CREATE TRIGGER trg_users_profile_updated_at
BEFORE UPDATE ON users_profile
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_meals_updated_at
BEFORE UPDATE ON meals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_serving_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Users Profile policies
CREATE POLICY "Users can view own profile"
  ON users_profile FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users_profile FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users_profile FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Foods policies
CREATE POLICY "Anyone can view public foods"
  ON foods FOR SELECT
  USING (is_public = TRUE OR created_by = auth.uid() OR source = 'usda');

CREATE POLICY "Users can create foods"
  ON foods FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own foods"
  ON foods FOR UPDATE
  USING (created_by = auth.uid() AND source != 'usda');

CREATE POLICY "Users can delete own foods"
  ON foods FOR DELETE
  USING (created_by = auth.uid() AND source != 'usda');

-- Food serving units policies
CREATE POLICY "Anyone can view serving units for accessible foods"
  ON food_serving_units FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM foods f
      WHERE f.id = food_id
        AND (f.is_public = TRUE OR f.created_by = auth.uid() OR f.source = 'usda')
    )
  );

CREATE POLICY "Users can manage serving units for own foods"
  ON food_serving_units FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM foods f
      WHERE f.id = food_id AND f.created_by = auth.uid()
    )
  );

-- Meals policies
CREATE POLICY "Users can view own meals"
  ON meals FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own meals"
  ON meals FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own meals"
  ON meals FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own meals"
  ON meals FOR DELETE
  USING (user_id = auth.uid());

-- Meal items policies
CREATE POLICY "Users can view items in own meals"
  ON meal_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meals m WHERE m.id = meal_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage items in own meals"
  ON meal_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM meals m WHERE m.id = meal_id AND m.user_id = auth.uid()
    )
  );

-- Weight logs policies
CREATE POLICY "Users can view own weight logs"
  ON weight_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own weight logs"
  ON weight_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own weight logs"
  ON weight_logs FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own weight logs"
  ON weight_logs FOR DELETE
  USING (user_id = auth.uid());

-- Goals policies
CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own goals"
  ON goals FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  USING (user_id = auth.uid());
