<objective>
Create the AI system prompts and tool definitions for Gemini 3 Pro integration.

This includes all prompts for:
- Text-based meal parsing
- Photo-based meal analysis
- Clarifying questions when confidence is low
- Food creation for unknown items
- In both English and Brazilian Portuguese
</objective>

<context>
AI model: Gemini 3 Pro Preview via OpenRouter
Confidence threshold: 70% minimum to log, otherwise ask questions
No image storage: Base64 sent directly to AI, processed in real-time

Multiple AI entrypoints:
1. Text input: "I ate 2 eggs and toast"
2. Photo input: User takes picture of plate
3. Photo + context: Photo with user description
4. Clarifying conversation: AI asks until confident
</context>

<requirements>
1. Create prompt templates in `./src/lib/ai/prompts/`:

   **meal-parse-text.ts** (EN + PT-BR):
   - System prompt for parsing natural language meal descriptions
   - Extract: foods, quantities, units
   - Return structured JSON with confidence scores
   - If food not in DB, include nutrition estimates

   **meal-parse-photo.ts** (EN + PT-BR):
   - System prompt for analyzing food photos
   - Identify visible foods and estimate portions
   - Lower confidence threshold (visual estimation)
   - Request clarification for unclear items

   **meal-clarify.ts** (EN + PT-BR):
   - System prompt for asking clarifying questions
   - When confidence < 70%
   - Ask about specific items, portions, preparation
   - Maximum 3 rounds of questions

   **food-create.ts** (EN + PT-BR):
   - System prompt for creating new foods
   - When user mentions unknown food (e.g., "Chipotle bowl")
   - Use web search to estimate nutrition
   - Flag as ai_generated

   **food-search-web.ts** (EN + PT-BR):
   - System prompt for web search tool
   - Find nutrition info for restaurant/branded foods
   - Return structured nutrition data

2. Create tool definitions in `./src/lib/ai/tools/`:
   - search_foods - Search food database
   - create_food - Create new food entry
   - log_meal - Log confirmed meal
   - get_daily_summary - Get today's nutrition
   - web_search - Search for nutrition info

3. Create AI client in `./src/lib/ai/client.ts`:
   - OpenRouter client configuration
   - Gemini 3 Pro model settings
   - Tool calling setup
   - Response streaming support

4. Create conversation manager in `./src/lib/ai/conversation.ts`:
   - Track conversation state
   - Handle multi-turn clarifications
   - Merge photo + text context
   - Calculate overall confidence
</requirements>

<implementation>
Prompt structure for meal parsing:
```
You are a nutrition tracking assistant. Your job is to identify foods from user input and estimate their nutritional content.

LANGUAGE: {locale}
USER TIMEZONE: {timezone}

For each food identified, provide:
- name: The food name
- quantity: Numeric amount
- unit: g, oz, cup, piece, slice, tbsp, etc.
- confidence: 0.0 to 1.0
- nutrition_per_serving: { calories, protein, carbs, fat }
- notes: Any assumptions made

If confidence < 0.7 for any item, include clarifying_questions array.

Respond in JSON format only.
```

Clarifying question patterns:
- "How much {food} did you have? (e.g., 1 cup, 2 pieces)"
- "Was the {food} prepared with any oil, butter, or sauce?"
- "What size was the {food}? (small, medium, large)"
- "Is this a restaurant meal or homemade?"

Portuguese equivalents:
- "Quanto de {food} você comeu? (ex: 1 xícara, 2 unidades)"
- "O {food} foi preparado com óleo, manteiga ou molho?"
- "Qual era o tamanho do {food}? (pequeno, médio, grande)"
- "É uma refeição de restaurante ou caseira?"
</implementation>

<output>
Create files:
- `./src/lib/ai/prompts/meal-parse-text.ts`
- `./src/lib/ai/prompts/meal-parse-photo.ts`
- `./src/lib/ai/prompts/meal-clarify.ts`
- `./src/lib/ai/prompts/food-create.ts`
- `./src/lib/ai/prompts/food-search-web.ts`
- `./src/lib/ai/prompts/index.ts`
- `./src/lib/ai/tools/definitions.ts`
- `./src/lib/ai/tools/handlers.ts`
- `./src/lib/ai/client.ts`
- `./src/lib/ai/conversation.ts`
- `./src/lib/ai/types.ts`
- `./src/lib/ai/index.ts`
</output>

<verification>
Before completing:
1. All prompts have EN and PT-BR versions
2. JSON response schemas are well-defined
3. Tool definitions match domain repositories
4. Confidence thresholds documented
5. Error handling for API failures
</verification>

<success_criteria>
- Complete bilingual prompts for all AI interactions
- Tool definitions match database operations
- Clear confidence thresholds and question logic
- Streaming support configured
- Robust error handling
</success_criteria>
