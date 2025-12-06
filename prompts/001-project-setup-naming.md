<objective>
Initialize the Next.js 14+ project with App Router, configure the complete tech stack, and establish the app name/branding.

This is the foundation for a beautiful, minimalist AI-powered nutrition tracking app. The name must be:
- Easy to pronounce in both English and Brazilian Portuguese
- Short, memorable, and unique
- Evokes health/nutrition/simplicity without being generic
</objective>

<context>
Tech stack:
- Next.js 14+ with App Router
- React 18+
- TypeScript (strict mode)
- Tailwind CSS
- Supabase (auth, database, edge functions)
- PWA-ready configuration
- Gemini 3 Pro via OpenRouter for AI features

Design philosophy: Cal.ai meets Apple meets MyFitnessPal meets Gemini. Gorgeous, minimalist, mobile-first.
</context>

<requirements>
1. Create Next.js project with TypeScript strict mode
2. Configure Tailwind CSS with a custom design system:
   - Color palette optimized for health/wellness (clean, calming, energetic accents)
   - Typography scale for mobile-first design
   - Spacing scale for consistent layouts
3. Set up project structure following atomic design:
   ```
   src/
     app/           # Next.js App Router pages
     components/
       atoms/       # Buttons, inputs, icons, text
       molecules/   # Form fields, cards, list items
       organisms/   # Headers, forms, meal cards
       templates/   # Page layouts
     lib/           # Utilities, API clients
     domain/        # Domain logic (DDD)
     hooks/         # Custom React hooks
     types/         # TypeScript types
     i18n/          # Internationalization
     styles/        # Global styles
   ```
4. Configure PWA with next-pwa:
   - Manifest with app name and icons
   - Service worker for offline capability
   - iOS and Android optimized meta tags
5. Create environment configuration:
   - `.env.example` with all required variables
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENROUTER_API_KEY`
6. Propose 3-4 app name options with reasoning, then select the best one

Name suggestions to consider (or improve upon):
- "Nutri" (simple but common)
- "Calo" (calories, easy pronunciation)
- "Vita" (life, health)
- "Noma" (nourishment + ma)
- Create your own that's better
</requirements>

<output>
Create/modify files with relative paths:
- `./package.json` - Dependencies and scripts
- `./tsconfig.json` - TypeScript strict config
- `./next.config.js` - Next.js + PWA config
- `./tailwind.config.ts` - Design system tokens
- `./src/app/layout.tsx` - Root layout with meta
- `./src/app/globals.css` - Global styles
- `./src/styles/tokens.css` - CSS custom properties
- `./.env.example` - Environment template
- `./public/manifest.json` - PWA manifest
- `./README.md` - Project overview with chosen name
</output>

<verification>
Before completing:
1. Run `npm install` successfully
2. Run `npm run dev` starts without errors
3. Verify TypeScript strict mode catches type errors
4. Confirm Tailwind classes work in layout
5. Test PWA manifest loads correctly
</verification>

<success_criteria>
- Project runs with `npm run dev`
- TypeScript strict mode enabled
- Tailwind design tokens defined
- PWA manifest configured with final app name
- Clear README with app name, vision, and setup instructions
- Environment example file with all variables documented
</success_criteria>
