<objective>
Create the molecules layer of the atomic design system.

Molecules combine atoms into functional UI patterns. They handle specific interactions but remain reusable across the application.
</objective>

<context>
@./src/components/atoms/ - Atom components
@./src/i18n/ - Translations
@./tailwind.config.ts - Design tokens

Molecules should compose atoms, not duplicate their logic.
</context>

<requirements>
1. Create molecules in `./src/components/molecules/`:

   **FormField.tsx**:
   - Combines Label + Input + Error message
   - Consistent spacing and layout
   - Required indicator
   - Helper text support

   **SearchInput.tsx**:
   - Input with search icon
   - Debounced onChange
   - Clear button
   - Loading state

   **NumberInput.tsx**:
   - Input with +/- buttons
   - Min/max constraints
   - Step value
   - Unit display (g, oz, etc.)

   **SelectField.tsx**:
   - Custom styled select
   - Options with icons
   - Search within options
   - Mobile-friendly

   **MacroDisplay.tsx**:
   - Shows protein/carbs/fat/calories
   - Horizontal or vertical layout
   - With or without labels
   - Color-coded

   **CalorieRing.tsx**:
   - Circular progress for calories
   - Remaining vs consumed
   - Animated
   - Center text (remaining/target)

   **MealTypeSelector.tsx**:
   - Horizontal scrolling chips
   - All meal types
   - Selected state
   - Optional "none" option

   **FoodListItem.tsx**:
   - Food name, brand
   - Serving info
   - Quick add button
   - Swipe actions (mobile)

   **MealItemRow.tsx**:
   - Food name + quantity
   - Calories display
   - Edit/delete actions
   - Inline quantity edit

   **WeightLogItem.tsx**:
   - Date, weight, unit
   - Change indicator (+/- from previous)
   - Edit option

   **Toast.tsx**:
   - Success/error/info variants
   - Auto-dismiss
   - Action button option
   - Stack multiple

   **Modal.tsx**:
   - Overlay + content
   - Close button
   - Mobile: slides from bottom
   - Desktop: centered

   **BottomSheet.tsx**:
   - Mobile-only modal pattern
   - Drag to dismiss
   - Variable height
   - Handle indicator

   **ConfirmDialog.tsx**:
   - Title + message
   - Confirm/Cancel buttons
   - Danger variant for deletes

   **EmptyState.tsx**:
   - Icon + message
   - Optional action button
   - Various illustrations
</requirements>

<implementation>
Debounced search pattern:
```typescript
import { useState, useEffect, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export function SearchInput({ onSearch, delay = 300 }: Props) {
  const [value, setValue] = useState('');

  const debouncedSearch = useDebouncedCallback(
    (query: string) => onSearch(query),
    delay
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    debouncedSearch(e.target.value);
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      leftIcon={<Icon name="search" />}
      rightIcon={value && <button onClick={() => setValue('')}><Icon name="x" /></button>}
    />
  );
}
```

Bottom sheet with gesture:
```typescript
import { useDrag } from '@use-gesture/react';
import { animated, useSpring } from '@react-spring/web';

// Drag down to dismiss pattern
```
</implementation>

<output>
Create files:
- `./src/components/molecules/FormField.tsx`
- `./src/components/molecules/SearchInput.tsx`
- `./src/components/molecules/NumberInput.tsx`
- `./src/components/molecules/SelectField.tsx`
- `./src/components/molecules/MacroDisplay.tsx`
- `./src/components/molecules/CalorieRing.tsx`
- `./src/components/molecules/MealTypeSelector.tsx`
- `./src/components/molecules/FoodListItem.tsx`
- `./src/components/molecules/MealItemRow.tsx`
- `./src/components/molecules/WeightLogItem.tsx`
- `./src/components/molecules/Toast.tsx`
- `./src/components/molecules/Modal.tsx`
- `./src/components/molecules/BottomSheet.tsx`
- `./src/components/molecules/ConfirmDialog.tsx`
- `./src/components/molecules/EmptyState.tsx`
- `./src/components/molecules/index.ts`
</output>

<verification>
Before completing:
1. Molecules compose atoms correctly
2. Mobile interactions work (touch, swipe)
3. Animations are smooth
4. No duplicated atom logic
5. All text uses i18n
</verification>

<success_criteria>
- All molecules created
- Proper atom composition
- Mobile-optimized interactions
- Consistent patterns
- Accessible
</success_criteria>
