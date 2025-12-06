<objective>
Implement all Next.js API routes for the application.

These routes connect the frontend to the domain logic, handle authentication, and integrate with Supabase and the AI system.
</objective>

<context>
@./src/domain/ - All domain logic
@./src/lib/ai/ - AI system
@./src/lib/supabase/ - Supabase clients
@./src/lib/errors/ - Error handling
@./src/middleware.ts - Auth middleware

API should be RESTful with consistent error responses.
</context>

<requirements>
1. Create API routes in `./src/app/api/`:

   **auth/**:
   - `POST /api/auth/register` - Create account
   - `POST /api/auth/login` - Login
   - `POST /api/auth/logout` - Logout
   - `POST /api/auth/refresh` - Refresh token
   - `GET /api/auth/me` - Get current user

   **users/**:
   - `GET /api/users/profile` - Get profile
   - `PATCH /api/users/profile` - Update profile
   - `POST /api/users/onboarding` - Complete onboarding
   - `PATCH /api/users/preferences` - Update preferences

   **foods/**:
   - `GET /api/foods/search?q=` - Search foods
   - `GET /api/foods/:id` - Get food details
   - `POST /api/foods` - Create custom food
   - `PATCH /api/foods/:id` - Update food
   - `DELETE /api/foods/:id` - Delete food

   **meals/**:
   - `GET /api/meals?date=` - Get meals for date
   - `GET /api/meals/:id` - Get meal details
   - `POST /api/meals` - Create meal
   - `PATCH /api/meals/:id` - Update meal
   - `DELETE /api/meals/:id` - Delete meal
   - `POST /api/meals/:id/items` - Add item to meal
   - `PATCH /api/meals/:id/items/:itemId` - Update item
   - `DELETE /api/meals/:id/items/:itemId` - Remove item

   **weight/**:
   - `GET /api/weight?days=` - Get weight logs
   - `POST /api/weight` - Log weight
   - `GET /api/weight/trend` - Get weight trend

   **goals/**:
   - `GET /api/goals/active` - Get active goal
   - `POST /api/goals` - Create goal
   - `PATCH /api/goals/:id` - Update goal
   - `POST /api/goals/:id/archive` - Archive goal

   **summary/**:
   - `GET /api/summary/today` - Today's summary
   - `GET /api/summary/:date` - Specific date summary

   **ai/**:
   - `POST /api/ai/parse-text` - Parse meal from text
   - `POST /api/ai/parse-photo` - Parse meal from photo (base64)
   - `POST /api/ai/clarify` - Continue clarifying conversation
   - `POST /api/ai/create-food` - AI creates new food

2. Create API utilities in `./src/lib/api/`:
   - `response.ts` - Consistent response formatting
   - `validation.ts` - Request body validation with Zod
   - `auth.ts` - Get authenticated user from request
</requirements>

<implementation>
Response format:
```typescript
// Success
{ success: true, data: {...} }

// Error
{ success: false, error: { code: "VALIDATION_ERROR", message: "...", details: {...} } }
```

Validation with Zod:
```typescript
const createMealSchema = z.object({
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout']).nullable(),
  logged_at: z.string().datetime().optional(),
  items: z.array(z.object({
    food_id: z.string().uuid(),
    quantity: z.number().positive(),
    unit: z.string()
  })).min(1)
});
```

AI parse-photo endpoint:
- Accepts base64 image in request body
- Sends directly to Gemini (no storage)
- Returns parsed foods with confidence
- Includes clarifying questions if confidence < 70%
</implementation>

<output>
Create files:
- `./src/app/api/auth/register/route.ts`
- `./src/app/api/auth/login/route.ts`
- `./src/app/api/auth/logout/route.ts`
- `./src/app/api/auth/refresh/route.ts`
- `./src/app/api/auth/me/route.ts`
- `./src/app/api/users/profile/route.ts`
- `./src/app/api/users/onboarding/route.ts`
- `./src/app/api/users/preferences/route.ts`
- `./src/app/api/foods/search/route.ts`
- `./src/app/api/foods/[id]/route.ts`
- `./src/app/api/foods/route.ts`
- `./src/app/api/meals/route.ts`
- `./src/app/api/meals/[id]/route.ts`
- `./src/app/api/meals/[id]/items/route.ts`
- `./src/app/api/meals/[id]/items/[itemId]/route.ts`
- `./src/app/api/weight/route.ts`
- `./src/app/api/weight/trend/route.ts`
- `./src/app/api/goals/active/route.ts`
- `./src/app/api/goals/route.ts`
- `./src/app/api/goals/[id]/route.ts`
- `./src/app/api/goals/[id]/archive/route.ts`
- `./src/app/api/summary/today/route.ts`
- `./src/app/api/summary/[date]/route.ts`
- `./src/app/api/ai/parse-text/route.ts`
- `./src/app/api/ai/parse-photo/route.ts`
- `./src/app/api/ai/clarify/route.ts`
- `./src/app/api/ai/create-food/route.ts`
- `./src/lib/api/response.ts`
- `./src/lib/api/validation.ts`
- `./src/lib/api/auth.ts`
</output>

<verification>
Before completing:
1. All routes use domain services
2. Validation with Zod on all inputs
3. Proper error responses
4. Auth checks on protected routes
5. Consistent response format
</verification>

<success_criteria>
- All API routes implemented
- Request validation with Zod
- Proper error handling
- Consistent response format
- Auth properly enforced
</success_criteria>
