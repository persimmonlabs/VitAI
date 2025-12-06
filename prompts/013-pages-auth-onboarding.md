<objective>
Create the authentication and onboarding pages.

These are the first pages users see. They must be:
- Beautiful and welcoming
- Simple and fast
- Mobile-optimized
- Bilingual (EN/PT-BR)
</objective>

<context>
@./src/components/ - All components
@./src/app/api/auth/ - Auth API routes
@./src/domain/user/ - User domain
@./src/i18n/ - Translations

Pages use App Router with file-based routing.
</context>

<requirements>
1. Create public pages (no auth required):

   **`/` (landing)**:
   - App name and logo
   - Value proposition (1-2 sentences)
   - "Get Started" button → /signup
   - "Already have account?" → /login
   - Language switcher
   - Beautiful, minimal design

   **`/login`**:
   - Email + password form
   - Remember me option
   - Forgot password link
   - Sign up link
   - Social login buttons (future, placeholder)
   - Error handling

   **`/signup`**:
   - Email + password form
   - Password requirements visible
   - Terms acceptance checkbox
   - Login link
   - Success → redirect to onboarding

   **`/forgot-password`**:
   - Email input
   - Send reset link
   - Success message
   - Back to login

2. Create onboarding flow (`/onboarding/[step]`):

   **Step 1: Welcome**:
   - Personalized greeting
   - What the app does
   - "Let's set up your profile"

   **Step 2: Personal Info**:
   - Name (pre-filled from signup if available)
   - Age
   - Sex (for BMR calculation)
   - Height (with unit toggle)
   - Current weight (with unit toggle)

   **Step 3: Activity Level**:
   - 5 options with descriptions
   - Visual indicators
   - Help text explaining impact

   **Step 4: Goal**:
   - Goal type (lose/gain/maintain)
   - Target weight (optional)
   - Target date (optional)
   - Skip option

   **Step 5: Preferences**:
   - Unit system (metric/imperial)
   - Language (EN/PT-BR)
   - Timezone (auto-detect with manual option)

   **Step 6: Complete**:
   - Calculated calorie target
   - Summary of profile
   - "Start Tracking" button → /app

3. Create layouts:
   - `./src/app/(public)/layout.tsx` - Public pages layout
   - `./src/app/onboarding/layout.tsx` - Onboarding layout
</requirements>

<implementation>
Onboarding form state:
```typescript
// Use React Hook Form with Zod validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const onboardingSchema = z.object({
  name: z.string().min(2),
  age: z.number().min(13).max(120),
  sex: z.enum(['male', 'female']),
  height: z.number().positive(),
  height_unit: z.enum(['cm', 'in']),
  weight: z.number().positive(),
  weight_unit: z.enum(['kg', 'lbs']),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  // ... etc
});
```

Step navigation:
```typescript
const STEPS = ['welcome', 'personal', 'activity', 'goal', 'preferences', 'complete'];

// Use URL params for step
// /onboarding/personal, /onboarding/activity, etc.
```

Password validation display:
```typescript
const requirements = [
  { label: '8+ characters', met: password.length >= 8 },
  { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
  { label: 'Lowercase letter', met: /[a-z]/.test(password) },
  { label: 'Number', met: /\d/.test(password) },
  { label: 'Special character', met: /[!@#$%^&*]/.test(password) },
];
```
</implementation>

<output>
Create files:
- `./src/app/(public)/layout.tsx`
- `./src/app/(public)/page.tsx` (landing)
- `./src/app/(public)/login/page.tsx`
- `./src/app/(public)/signup/page.tsx`
- `./src/app/(public)/forgot-password/page.tsx`
- `./src/app/onboarding/layout.tsx`
- `./src/app/onboarding/[step]/page.tsx`
- `./src/app/onboarding/components/WelcomeStep.tsx`
- `./src/app/onboarding/components/PersonalInfoStep.tsx`
- `./src/app/onboarding/components/ActivityLevelStep.tsx`
- `./src/app/onboarding/components/GoalStep.tsx`
- `./src/app/onboarding/components/PreferencesStep.tsx`
- `./src/app/onboarding/components/CompleteStep.tsx`
</output>

<verification>
Before completing:
1. All forms validate correctly
2. Error messages display
3. Navigation between steps works
4. Data persists between steps
5. Final submit creates profile
6. Mobile responsive
</verification>

<success_criteria>
- Beautiful, minimal auth pages
- Complete 6-step onboarding
- Full form validation
- Bilingual support
- Mobile-optimized
</success_criteria>
