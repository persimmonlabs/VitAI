import { z } from 'zod';

// ============================================
// AI RESPONSE TYPES
// ============================================

export const parsedFoodItemSchema = z.object({
  name: z.string(),
  quantity: z.number().positive(),
  unit: z.string(),
  confidence: z.number().min(0).max(1),
  nutrition_per_serving: z.object({
    calories: z.number().nonnegative(),
    protein: z.number().nonnegative(),
    carbs: z.number().nonnegative(),
    fat: z.number().nonnegative(),
  }),
  notes: z.string().optional(),
  food_id: z.string().uuid().optional(), // If matched to existing food
  is_new: z.boolean().default(false), // If AI created new food
});

export type ParsedFoodItem = z.infer<typeof parsedFoodItemSchema>;

export const mealParseResultSchema = z.object({
  success: z.boolean(),
  items: z.array(parsedFoodItemSchema),
  overall_confidence: z.number().min(0).max(1),
  meal_type_suggestion: z.enum([
    'breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'
  ]).optional(),
  clarifying_questions: z.array(z.object({
    item_index: z.number(),
    question: z.string(),
    question_type: z.enum(['quantity', 'preparation', 'size', 'type']),
  })).optional(),
  error: z.string().optional(),
});

export type MealParseResult = z.infer<typeof mealParseResultSchema>;

export const clarifyingQuestionSchema = z.object({
  item_index: z.number(),
  question: z.string(),
  question_type: z.enum(['quantity', 'preparation', 'size', 'type']),
  options: z.array(z.string()).optional(),
});

export type ClarifyingQuestion = z.infer<typeof clarifyingQuestionSchema>;

export const foodCreationResultSchema = z.object({
  success: z.boolean(),
  food: z.object({
    name: z.string(),
    brand: z.string().optional(),
    protein_per_100g: z.number(),
    carbs_per_100g: z.number(),
    fat_per_100g: z.number(),
    fiber_per_100g: z.number().optional(),
    calories_per_100g: z.number(),
    source: z.literal('ai_generated'),
    serving_size: z.object({
      unit: z.string(),
      grams: z.number(),
    }).optional(),
  }).optional(),
  confidence: z.number().min(0).max(1),
  sources: z.array(z.string()).optional(),
  error: z.string().optional(),
});

export type FoodCreationResult = z.infer<typeof foodCreationResultSchema>;

// ============================================
// CONVERSATION STATE
// ============================================

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    image_base64?: string;
    parsed_result?: MealParseResult;
  };
}

export interface ConversationState {
  id: string;
  user_id: string;
  messages: ConversationMessage[];
  current_parse_result?: MealParseResult;
  clarification_round: number;
  max_clarification_rounds: number;
  locale: 'en' | 'pt-BR';
  created_at: Date;
  updated_at: Date;
}

// ============================================
// AI CLIENT TYPES
// ============================================

export interface AIClientConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
  maxTokens: number;
  temperature: number;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | AIContentPart[];
}

export interface AIContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string; // Base64 data URL
  };
}

export interface AIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface AIResponse {
  id: string;
  choices: {
    message: {
      role: 'assistant';
      content: string | null;
      tool_calls?: AIToolCall[];
    };
    finish_reason: 'stop' | 'tool_calls' | 'length' | 'content_filter';
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ============================================
// TOOL DEFINITIONS
// ============================================

export interface AITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

export type ToolName =
  | 'search_foods'
  | 'create_food'
  | 'log_meal'
  | 'get_daily_summary'
  | 'web_search';

export type Locale = 'en' | 'pt-BR';

export const CONFIDENCE_THRESHOLD = 0.7;
export const MAX_CLARIFICATION_ROUNDS = 3;
