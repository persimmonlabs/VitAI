<objective>
Create the atomic design system - atoms layer.

These are the foundational UI components that will be composed into larger components. They must be:
- Fully typed with TypeScript
- Accessible (ARIA)
- Mobile-first responsive
- Consistent with design tokens
- Reusable with no hardcoded values
</objective>

<context>
@./tailwind.config.ts - Design tokens
@./src/i18n/ - Translations

Design philosophy: Apple-level minimalism, gorgeous but simple.
Mobile-first: Every component designed for touch first.
</context>

<requirements>
1. Create atoms in `./src/components/atoms/`:

   **Button.tsx**:
   - Variants: primary, secondary, ghost, danger
   - Sizes: sm, md, lg
   - States: default, hover, active, disabled, loading
   - Icon support (left, right, icon-only)
   - Full width option

   **Input.tsx**:
   - Types: text, email, password, number
   - States: default, focus, error, disabled
   - Label, placeholder, helper text
   - Error message display
   - Icon support (left, right)

   **Text.tsx**:
   - Variants: h1, h2, h3, h4, body, caption, label
   - Colors from theme
   - Weight options
   - Truncation support

   **Icon.tsx**:
   - Wrapper for icon library (lucide-react)
   - Consistent sizing
   - Color inheritance

   **Badge.tsx**:
   - Variants: default, success, warning, error, info
   - Sizes: sm, md

   **Spinner.tsx**:
   - Sizes: sm, md, lg
   - Color options

   **Avatar.tsx**:
   - Image or initials fallback
   - Sizes: sm, md, lg, xl

   **Divider.tsx**:
   - Horizontal/vertical
   - With/without label

   **ProgressBar.tsx**:
   - Determinate/indeterminate
   - Color variants
   - Animated

   **Chip.tsx**:
   - Removable option
   - Selected state
   - Variants

   **Toggle.tsx**:
   - On/off states
   - Sizes
   - Disabled state

   **Skeleton.tsx**:
   - Various shapes (text, circle, rectangle)
   - Animation

2. Each component must have:
   - TypeScript interface for props
   - Default props where appropriate
   - forwardRef for DOM access
   - className prop for extension
   - data-testid for testing
</requirements>

<implementation>
Component structure pattern:
```typescript
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // base styles
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          // variant styles
          variants[variant],
          // size styles
          sizes[size],
          // full width
          fullWidth && 'w-full',
          className
        )}
        disabled={isLoading || props.disabled}
        data-testid="button"
        {...props}
      >
        {isLoading ? <Spinner size="sm" /> : children}
      </button>
    );
  }
);
```

Utility function `cn`:
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
</implementation>

<output>
Create files:
- `./src/lib/utils.ts` - cn utility
- `./src/components/atoms/Button.tsx`
- `./src/components/atoms/Input.tsx`
- `./src/components/atoms/Text.tsx`
- `./src/components/atoms/Icon.tsx`
- `./src/components/atoms/Badge.tsx`
- `./src/components/atoms/Spinner.tsx`
- `./src/components/atoms/Avatar.tsx`
- `./src/components/atoms/Divider.tsx`
- `./src/components/atoms/ProgressBar.tsx`
- `./src/components/atoms/Chip.tsx`
- `./src/components/atoms/Toggle.tsx`
- `./src/components/atoms/Skeleton.tsx`
- `./src/components/atoms/index.ts` - Barrel export
</output>

<verification>
Before completing:
1. All components render without errors
2. TypeScript types are complete
3. Tailwind classes use design tokens
4. Components are accessible
5. No hardcoded colors/sizes
</verification>

<success_criteria>
- All atoms created with consistent patterns
- Full TypeScript coverage
- Accessible (keyboard, screen readers)
- Mobile-first responsive
- Reusable with no duplication
</success_criteria>
