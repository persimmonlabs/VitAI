<objective>
Design and create the complete Supabase database schema for the nutrition tracking MVP.

This schema must support:
- User profiles with preferences (units, timezone, language)
- Food database with public/private distinction
- Meals containing meal items
- Weight tracking over time
- Calorie/macro goals
- AI-generated foods flagged appropriately
</objective>

<context>
MVP scope: Meal tracking, weight logging, onboarding, profile management.
NO workout/activity features.

Key requirements from PRD:
- Password: 8+ chars, special chars, numbers, upper/lower case (Supabase auth config)
- Units: metric/imperial user choice
- Meals: breakfast, lunch, dinner, snack, pre-workout, post-workout, or no type
- Food database: private by default, can be made public
- AI can create foods (flagged as ai_generated)
- All nutrition stored per 100g, with serving conversions
</context>

<requirements>
1. Create SQL migration file with all tables:

   **users_profile** (extends Supabase auth.users):
   - id (references auth.users)
   - name, email
   - age, sex, height_cm
   - activity_level (sedentary, light, moderate, active, very_active)
   - unit_system (metric, imperial)
   - timezone
   - language (en, pt-BR)
   - daily_calorie_target
   - onboarding_completed
   - created_at, updated_at

   **foods**:
   - id, name, brand (optional)
   - calories_per_100g (computed from macros)
   - protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g
   - sugar_per_100g, sodium_mg_per_100g (optional)
   - source (usda, user, ai_generated)
   - is_public (boolean, default false)
   - created_by (user_id, nullable for public foods)
   - created_at

   **food_serving_units**:
   - id, food_id
   - unit_name (g, oz, cup, piece, slice, tbsp, etc.)
   - grams_equivalent
   - is_default

   **meals**:
   - id, user_id
   - meal_type (breakfast, lunch, dinner, snack, pre_workout, post_workout, null)
   - logged_at (timestamp)
   - notes (optional)
   - total_calories, total_protein, total_carbs, total_fat (computed)
   - created_at, updated_at

   **meal_items**:
   - id, meal_id, food_id
   - quantity, unit
   - calories, protein, carbs, fat (computed from food + quantity)
   - created_at

   **weight_logs**:
   - id, user_id
   - weight_value, weight_unit (kg, lbs)
   - logged_at
   - created_at

   **goals**:
   - id, user_id
   - goal_type (weight_loss, weight_gain, maintenance)
   - target_weight, target_weight_unit
   - target_date
   - start_weight, start_date
   - status (active, completed, abandoned)
   - created_at

2. Create Row Level Security (RLS) policies:
   - Users can only read/write their own data
   - Public foods readable by all
   - Private foods only by creator

3. Create database functions:
   - calculate_meal_totals(meal_id) - sums meal items
   - get_daily_summary(user_id, date) - aggregates day's nutrition

4. Create indexes for common queries:
   - foods: name full-text search, source, is_public
   - meals: user_id + logged_at
   - weight_logs: user_id + logged_at

5. Create seed data file with ~50 common USDA foods
</requirements>

<output>
Create files:
- `./supabase/migrations/001_initial_schema.sql` - All tables, RLS, functions
- `./supabase/seed.sql` - USDA foods seed data
- `./docs/database-schema.md` - ERD and documentation
</output>

<constraints>
- Use UUID for all primary keys
- All timestamps in UTC
- Enforce: fiber_per_100g <= carbs_per_100g
- Enforce: sugar_per_100g <= carbs_per_100g
- Cascade deletes appropriately
- Use generated columns for computed calories: (protein*4 + carbs*4 + fat*9)
</constraints>

<verification>
The SQL should:
1. Run without errors on fresh Supabase instance
2. Seed data inserts successfully
3. RLS policies prevent cross-user access
4. Full-text search on foods.name works
5. Computed columns calculate correctly
</verification>

<success_criteria>
- Complete schema covering all MVP features
- RLS policies for multi-tenant security
- Seed data with 50+ common foods
- Clear documentation of schema design
- All constraints and validations in place
</success_criteria>
