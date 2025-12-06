-- VitAI Seed Data
-- ~50 common USDA foods for initial database

-- Insert common foods from USDA database
INSERT INTO foods (name, brand, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, source, is_public) VALUES

-- PROTEINS
('Chicken Breast, Grilled', NULL, 31.0, 0.0, 3.6, 0.0, 0.0, 'usda', TRUE),
('Chicken Thigh, Grilled', NULL, 26.0, 0.0, 10.9, 0.0, 0.0, 'usda', TRUE),
('Beef, Ground, 90% Lean', NULL, 20.0, 0.0, 10.0, 0.0, 0.0, 'usda', TRUE),
('Beef, Ground, 80% Lean', NULL, 17.0, 0.0, 20.0, 0.0, 0.0, 'usda', TRUE),
('Salmon, Atlantic, Cooked', NULL, 25.4, 0.0, 12.4, 0.0, 0.0, 'usda', TRUE),
('Tuna, Canned in Water', NULL, 25.5, 0.0, 0.8, 0.0, 0.0, 'usda', TRUE),
('Shrimp, Cooked', NULL, 24.0, 0.2, 0.3, 0.0, 0.0, 'usda', TRUE),
('Eggs, Whole, Cooked', NULL, 13.0, 1.1, 11.0, 0.0, 1.1, 'usda', TRUE),
('Egg Whites, Cooked', NULL, 10.9, 0.7, 0.2, 0.0, 0.7, 'usda', TRUE),
('Turkey Breast, Roasted', NULL, 29.0, 0.0, 1.0, 0.0, 0.0, 'usda', TRUE),
('Pork Tenderloin, Roasted', NULL, 26.0, 0.0, 3.5, 0.0, 0.0, 'usda', TRUE),
('Tofu, Firm', NULL, 8.1, 1.9, 4.8, 0.3, 0.6, 'usda', TRUE),

-- DAIRY
('Milk, Whole', NULL, 3.2, 4.8, 3.3, 0.0, 5.0, 'usda', TRUE),
('Milk, Skim', NULL, 3.4, 5.0, 0.1, 0.0, 5.0, 'usda', TRUE),
('Greek Yogurt, Plain', NULL, 10.0, 3.6, 0.7, 0.0, 3.2, 'usda', TRUE),
('Cheese, Cheddar', NULL, 25.0, 1.3, 33.0, 0.0, 0.5, 'usda', TRUE),
('Cheese, Mozzarella', NULL, 22.0, 2.2, 22.0, 0.0, 1.0, 'usda', TRUE),
('Cottage Cheese, Low Fat', NULL, 11.1, 3.4, 1.0, 0.0, 2.7, 'usda', TRUE),

-- GRAINS & CARBS
('Rice, White, Cooked', NULL, 2.7, 28.0, 0.3, 0.4, 0.0, 'usda', TRUE),
('Rice, Brown, Cooked', NULL, 2.6, 23.0, 0.9, 1.8, 0.0, 'usda', TRUE),
('Pasta, Cooked', NULL, 5.0, 25.0, 1.0, 1.8, 0.6, 'usda', TRUE),
('Bread, White', NULL, 9.0, 49.0, 3.2, 2.7, 5.0, 'usda', TRUE),
('Bread, Whole Wheat', NULL, 13.0, 43.0, 3.4, 7.0, 6.0, 'usda', TRUE),
('Oatmeal, Cooked', NULL, 2.4, 12.0, 1.4, 1.7, 0.5, 'usda', TRUE),
('Quinoa, Cooked', NULL, 4.4, 21.3, 1.9, 2.8, 0.9, 'usda', TRUE),
('Potato, Baked', NULL, 2.5, 21.0, 0.1, 2.2, 1.2, 'usda', TRUE),
('Sweet Potato, Baked', NULL, 2.0, 21.0, 0.1, 3.3, 6.5, 'usda', TRUE),

-- FRUITS
('Apple', NULL, 0.3, 14.0, 0.2, 2.4, 10.4, 'usda', TRUE),
('Banana', NULL, 1.1, 23.0, 0.3, 2.6, 12.2, 'usda', TRUE),
('Orange', NULL, 0.9, 12.0, 0.1, 2.4, 9.4, 'usda', TRUE),
('Strawberries', NULL, 0.7, 7.7, 0.3, 2.0, 4.9, 'usda', TRUE),
('Blueberries', NULL, 0.7, 14.5, 0.3, 2.4, 10.0, 'usda', TRUE),
('Grapes', NULL, 0.6, 17.0, 0.2, 0.9, 16.0, 'usda', TRUE),
('Avocado', NULL, 2.0, 8.5, 15.0, 6.7, 0.7, 'usda', TRUE),

-- VEGETABLES
('Broccoli, Cooked', NULL, 2.4, 7.0, 0.4, 3.3, 1.4, 'usda', TRUE),
('Spinach, Raw', NULL, 2.9, 3.6, 0.4, 2.2, 0.4, 'usda', TRUE),
('Carrot, Raw', NULL, 0.9, 10.0, 0.2, 2.8, 4.7, 'usda', TRUE),
('Tomato, Raw', NULL, 0.9, 3.9, 0.2, 1.2, 2.6, 'usda', TRUE),
('Cucumber, Raw', NULL, 0.7, 3.6, 0.1, 0.5, 1.7, 'usda', TRUE),
('Bell Pepper, Raw', NULL, 1.0, 6.0, 0.3, 2.1, 4.2, 'usda', TRUE),
('Lettuce, Romaine', NULL, 1.2, 3.3, 0.3, 2.1, 1.2, 'usda', TRUE),
('Onion, Raw', NULL, 1.1, 9.3, 0.1, 1.7, 4.2, 'usda', TRUE),
('Mushrooms, White', NULL, 3.1, 3.3, 0.3, 1.0, 2.0, 'usda', TRUE),

-- LEGUMES & NUTS
('Black Beans, Cooked', NULL, 8.9, 24.0, 0.5, 8.7, 0.3, 'usda', TRUE),
('Chickpeas, Cooked', NULL, 8.9, 27.0, 2.6, 7.6, 4.8, 'usda', TRUE),
('Lentils, Cooked', NULL, 9.0, 20.0, 0.4, 7.9, 1.8, 'usda', TRUE),
('Almonds', NULL, 21.0, 22.0, 49.0, 12.5, 4.4, 'usda', TRUE),
('Peanut Butter', NULL, 25.0, 20.0, 50.0, 6.0, 9.0, 'usda', TRUE),
('Walnuts', NULL, 15.0, 14.0, 65.0, 6.7, 2.6, 'usda', TRUE),

-- OILS & FATS
('Olive Oil', NULL, 0.0, 0.0, 100.0, 0.0, 0.0, 'usda', TRUE),
('Butter', NULL, 0.9, 0.1, 81.0, 0.0, 0.1, 'usda', TRUE),
('Coconut Oil', NULL, 0.0, 0.0, 100.0, 0.0, 0.0, 'usda', TRUE);

-- Insert serving units for common foods
INSERT INTO food_serving_units (food_id, unit_name, grams_equivalent, is_default)
SELECT id, 'g', 1.0, TRUE FROM foods WHERE source = 'usda';

-- Add common serving sizes
INSERT INTO food_serving_units (food_id, unit_name, grams_equivalent, is_default)
SELECT id, 'oz', 28.35, FALSE FROM foods WHERE name IN (
  'Chicken Breast, Grilled', 'Beef, Ground, 90% Lean', 'Salmon, Atlantic, Cooked',
  'Turkey Breast, Roasted', 'Pork Tenderloin, Roasted', 'Cheese, Cheddar'
);

INSERT INTO food_serving_units (food_id, unit_name, grams_equivalent, is_default)
SELECT id, 'cup', 240.0, FALSE FROM foods WHERE name IN (
  'Milk, Whole', 'Milk, Skim', 'Rice, White, Cooked', 'Rice, Brown, Cooked',
  'Pasta, Cooked', 'Oatmeal, Cooked', 'Quinoa, Cooked'
);

INSERT INTO food_serving_units (food_id, unit_name, grams_equivalent, is_default)
SELECT id, 'large', 50.0, FALSE FROM foods WHERE name = 'Eggs, Whole, Cooked';

INSERT INTO food_serving_units (food_id, unit_name, grams_equivalent, is_default)
SELECT id, 'medium', 182.0, FALSE FROM foods WHERE name = 'Apple';

INSERT INTO food_serving_units (food_id, unit_name, grams_equivalent, is_default)
SELECT id, 'medium', 118.0, FALSE FROM foods WHERE name = 'Banana';

INSERT INTO food_serving_units (food_id, unit_name, grams_equivalent, is_default)
SELECT id, 'slice', 30.0, FALSE FROM foods WHERE name IN ('Bread, White', 'Bread, Whole Wheat');

INSERT INTO food_serving_units (food_id, unit_name, grams_equivalent, is_default)
SELECT id, 'tbsp', 16.0, FALSE FROM foods WHERE name = 'Peanut Butter';

INSERT INTO food_serving_units (food_id, unit_name, grams_equivalent, is_default)
SELECT id, 'tbsp', 14.0, FALSE FROM foods WHERE name IN ('Olive Oil', 'Butter', 'Coconut Oil');

INSERT INTO food_serving_units (food_id, unit_name, grams_equivalent, is_default)
SELECT id, 'container', 170.0, FALSE FROM foods WHERE name = 'Greek Yogurt, Plain';

INSERT INTO food_serving_units (food_id, unit_name, grams_equivalent, is_default)
SELECT id, 'medium', 150.0, FALSE FROM foods WHERE name = 'Potato, Baked';

INSERT INTO food_serving_units (food_id, unit_name, grams_equivalent, is_default)
SELECT id, 'medium', 200.0, FALSE FROM foods WHERE name = 'Avocado';
