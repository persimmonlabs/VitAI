<objective>
Implement the User Profile domain following Domain-Driven Design principles with comprehensive test coverage.

This domain handles user registration, authentication, profile management, onboarding, and preferences. Tests MUST pass before moving to the next domain.
</objective>

<context>
@./supabase/migrations/001_initial_schema.sql - Database schema
@./src/types/ - Existing type definitions

This is the first domain implementation. It establishes patterns for:
- Domain entities and value objects
- Repository pattern for data access
- Service layer for business logic
- Type-safe Supabase client usage
</context>

<requirements>
1. Create domain types in `./src/domain/user/types.ts`:
   ```typescript
   - UserProfile entity
   - UnitSystem enum (metric, imperial)
   - ActivityLevel enum
   - Language enum (en, pt-BR)
   - OnboardingData value object
   - UserPreferences value object
   ```

2. Create repository in `./src/domain/user/repository.ts`:
   - getUserProfile(userId)
   - createUserProfile(data)
   - updateUserProfile(userId, data)
   - completeOnboarding(userId, onboardingData)
   - updatePreferences(userId, preferences)

3. Create service in `./src/domain/user/service.ts`:
   - validateOnboardingData(data) - age 13-120, positive height/weight
   - calculateBMR(profile) - Mifflin-St Jeor equation
   - calculateTDEE(profile) - BMR * activity multiplier
   - suggestCalorieTarget(profile, goal) - based on TDEE and goal
   - convertWeight(value, from, to) - kg/lbs conversion
   - convertHeight(value, from, to) - cm/inches conversion

4. Create Supabase client in `./src/lib/supabase/`:
   - `client.ts` - Browser client
   - `server.ts` - Server client for API routes
   - `types.ts` - Generated types from schema

5. Write comprehensive tests in `./src/domain/user/__tests__/`:
   - `types.test.ts` - Type validation
   - `service.test.ts` - Business logic (BMR, TDEE, conversions)
   - `repository.test.ts` - Data access (mock Supabase)
</requirements>

<implementation>
Password validation (Supabase auth config):
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

BMR Calculation (Mifflin-St Jeor):
- Male: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
- Female: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161

Activity Multipliers:
- Sedentary: 1.2
- Light: 1.375
- Moderate: 1.55
- Active: 1.725
- Very Active: 1.9

Unit conversions:
- 1 kg = 2.20462 lbs
- 1 cm = 0.393701 inches
</implementation>

<output>
Create files:
- `./src/domain/user/types.ts`
- `./src/domain/user/repository.ts`
- `./src/domain/user/service.ts`
- `./src/domain/user/index.ts` - Public exports
- `./src/domain/user/__tests__/types.test.ts`
- `./src/domain/user/__tests__/service.test.ts`
- `./src/domain/user/__tests__/repository.test.ts`
- `./src/lib/supabase/client.ts`
- `./src/lib/supabase/server.ts`
- `./src/lib/supabase/types.ts`
</output>

<verification>
Run tests before completing:
!npm test -- --testPathPattern="domain/user"

All tests must pass:
- Type validation tests
- BMR/TDEE calculation accuracy
- Unit conversion accuracy
- Repository CRUD operations (mocked)
- Onboarding validation edge cases
</verification>

<success_criteria>
- All tests pass with `npm test`
- Types are strict and comprehensive
- Repository follows consistent patterns
- Service contains only pure business logic
- Supabase clients properly configured
- Code is well-documented
</success_criteria>
