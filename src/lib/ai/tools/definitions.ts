import type { AITool } from '../types';

export const searchFoodsTool: AITool = {
  type: 'function',
  function: {
    name: 'search_foods',
    description: 'Search the food database for items matching a query. Returns foods with their nutritional information.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query (food name, brand, etc.)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 10)',
        },
        include_user_foods: {
          type: 'boolean',
          description: 'Include user-created foods in results (default: true)',
        },
      },
      required: ['query'],
    },
  },
};

export const createFoodTool: AITool = {
  type: 'function',
  function: {
    name: 'create_food',
    description: 'Create a new food entry in the database. Used when a food is not found in the existing database.',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The food name',
        },
        brand: {
          type: 'string',
          description: 'Brand or restaurant name (optional)',
        },
        protein_per_100g: {
          type: 'number',
          description: 'Protein in grams per 100g',
        },
        carbs_per_100g: {
          type: 'number',
          description: 'Carbohydrates in grams per 100g',
        },
        fat_per_100g: {
          type: 'number',
          description: 'Fat in grams per 100g',
        },
        fiber_per_100g: {
          type: 'number',
          description: 'Fiber in grams per 100g (optional)',
        },
        serving_unit: {
          type: 'string',
          description: 'Typical serving unit (e.g., "piece", "cup", "slice")',
        },
        serving_grams: {
          type: 'number',
          description: 'Grams equivalent of one serving unit',
        },
      },
      required: ['name', 'protein_per_100g', 'carbs_per_100g', 'fat_per_100g'],
    },
  },
};

export const logMealTool: AITool = {
  type: 'function',
  function: {
    name: 'log_meal',
    description: 'Log a confirmed meal with its food items to the user\'s daily log.',
    parameters: {
      type: 'object',
      properties: {
        meal_type: {
          type: 'string',
          enum: ['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'],
          description: 'The type of meal',
        },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              food_id: {
                type: 'string',
                description: 'UUID of the food in the database',
              },
              quantity: {
                type: 'number',
                description: 'Amount of the food',
              },
              unit: {
                type: 'string',
                description: 'Unit of measurement',
              },
            },
            required: ['food_id', 'quantity', 'unit'],
          },
          description: 'Array of food items in the meal',
        },
        notes: {
          type: 'string',
          description: 'Optional notes about the meal',
        },
      },
      required: ['items'],
    },
  },
};

export const getDailySummaryTool: AITool = {
  type: 'function',
  function: {
    name: 'get_daily_summary',
    description: 'Get the user\'s nutrition summary for today, including calories and macros consumed vs. target.',
    parameters: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format (default: today)',
        },
      },
    },
  },
};

export const webSearchTool: AITool = {
  type: 'function',
  function: {
    name: 'web_search',
    description: 'Search the web for nutritional information about a specific food, especially restaurant or branded items.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for nutritional information',
        },
        food_name: {
          type: 'string',
          description: 'The specific food name to search for',
        },
        brand: {
          type: 'string',
          description: 'Brand or restaurant name (if applicable)',
        },
      },
      required: ['query', 'food_name'],
    },
  },
};

export const allTools: AITool[] = [
  searchFoodsTool,
  createFoodTool,
  logMealTool,
  getDailySummaryTool,
  webSearchTool,
];

export function getToolByName(name: string): AITool | undefined {
  return allTools.find((tool) => tool.function.name === name);
}
