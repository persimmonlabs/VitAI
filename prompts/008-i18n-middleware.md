<objective>
Implement internationalization (i18n) for English and Brazilian Portuguese, plus middleware for authentication, error handling, and logging.

This creates consistent infrastructure used across all pages and API routes.
</objective>

<context>
Languages: English (en), Brazilian Portuguese (pt-BR)
Default: English
Detection: Browser preference, then user setting

All user-facing text must be translatable, including:
- UI labels and buttons
- Error messages
- AI prompts (already created in 007)
- Form validation messages
- Success/failure notifications
</context>

<requirements>
1. Set up i18n in `./src/i18n/`:

   **config.ts**:
   - Supported locales: ['en', 'pt-BR']
   - Default locale: 'en'
   - Locale detection strategy

   **dictionaries/en.json**:
   - All UI text in English
   - Organized by feature: common, auth, onboarding, meals, weight, settings

   **dictionaries/pt-BR.json**:
   - All UI text in Brazilian Portuguese
   - Same structure as English

   **hooks/useTranslation.ts**:
   - React hook for accessing translations
   - Interpolation support: {name}, {count}
   - Pluralization support

   **utils/locale.ts**:
   - detectLocale(request)
   - getLocaleFromCookie()
   - setLocaleCookie(locale)

2. Create middleware in `./src/middleware.ts`:

   **Authentication check**:
   - Protect /app/* routes
   - Redirect to /login if not authenticated
   - Redirect to /onboarding if not completed
   - Allow /api/auth/* without auth

   **Locale detection**:
   - Check cookie first
   - Then Accept-Language header
   - Set locale in request headers

   **Rate limiting** (basic):
   - 100 requests per minute per IP
   - 429 response when exceeded

3. Create error handling in `./src/lib/errors/`:

   **AppError class**:
   - code: string (VALIDATION_ERROR, NOT_FOUND, etc.)
   - message: string (translatable key)
   - statusCode: number
   - details: object (optional)

   **error-handler.ts**:
   - handleApiError(error) - Format for API responses
   - handleClientError(error) - Format for UI display
   - logError(error, context) - Structured logging

   **error-codes.ts**:
   - All error codes as constants
   - Mapping to HTTP status codes

4. Create logging in `./src/lib/logging/`:

   **logger.ts**:
   - Structured JSON logging
   - Log levels: debug, info, warn, error
   - Context injection (userId, requestId)
   - Environment-aware (dev vs prod)

   **request-logger.ts**:
   - Log API requests/responses
   - Timing information
   - Sanitize sensitive data
</requirements>

<implementation>
Translation structure example:
```json
{
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "confirm": "Confirm",
    "back": "Back",
    "next": "Next"
  },
  "auth": {
    "login": "Log In",
    "signup": "Sign Up",
    "logout": "Log Out",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot password?",
    "errors": {
      "invalidCredentials": "Invalid email or password",
      "emailRequired": "Email is required",
      "passwordTooShort": "Password must be at least 8 characters"
    }
  },
  "meals": {
    "addMeal": "Add Meal",
    "breakfast": "Breakfast",
    "lunch": "Lunch",
    "dinner": "Dinner",
    "snack": "Snack",
    "preWorkout": "Pre-Workout",
    "postWorkout": "Post-Workout",
    "calories": "{count} cal",
    "todaySummary": "Today's Summary"
  }
}
```

Middleware chain order:
1. Rate limiting check
2. Locale detection
3. Authentication check (for protected routes)
4. Request logging
</implementation>

<output>
Create files:
- `./src/i18n/config.ts`
- `./src/i18n/dictionaries/en.json`
- `./src/i18n/dictionaries/pt-BR.json`
- `./src/i18n/hooks/useTranslation.ts`
- `./src/i18n/utils/locale.ts`
- `./src/i18n/index.ts`
- `./src/middleware.ts`
- `./src/lib/errors/AppError.ts`
- `./src/lib/errors/error-handler.ts`
- `./src/lib/errors/error-codes.ts`
- `./src/lib/errors/index.ts`
- `./src/lib/logging/logger.ts`
- `./src/lib/logging/request-logger.ts`
- `./src/lib/logging/index.ts`
</output>

<verification>
Before completing:
1. Both dictionaries have identical keys
2. Middleware protects correct routes
3. Error codes map to proper HTTP status
4. Logging sanitizes passwords/tokens
5. Rate limiting works correctly
</verification>

<success_criteria>
- Complete EN and PT-BR translations
- Middleware correctly protects routes
- Errors are user-friendly and logged
- Logging is structured and sanitized
- All infrastructure is consistent
</success_criteria>
