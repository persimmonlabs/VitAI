# VitAI - Smart Nutrition Tracking

> AI-powered nutrition tracking made simple and beautiful.

VitAI combines the elegant simplicity of Apple's design philosophy with the power of AI to make nutrition tracking effortless. Log meals with a photo, a text description, or manual entry - VitAI understands and tracks it all.

## Vision

**"Cal.ai meets Apple meets MyFitnessPal meets Gemini"**

- **Gorgeous & Minimalist**: Clean, modern UI optimized for mobile
- **AI-Powered**: Gemini 3 Pro analyzes your meals from photos or text
- **Bilingual**: Full support for English and Brazilian Portuguese
- **Smart**: Learns your preferences and common foods

## Features

- **Photo Logging**: Snap a picture, AI identifies the food
- **Text Logging**: Describe your meal naturally, AI parses it
- **Manual Entry**: Search our food database or create custom foods
- **Weight Tracking**: Monitor your progress with beautiful charts
- **Daily Goals**: Personalized calorie and macro targets
- **PWA Ready**: Install on any device, works offline

## Tech Stack

- **Frontend**: Next.js 14+, React 18+, TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Backend**: Supabase (Auth, PostgreSQL, Edge Functions)
- **AI**: Gemini 3 Pro via OpenRouter
- **State**: React Query for server state
- **Forms**: React Hook Form + Zod validation
- **i18n**: next-intl for internationalization

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenRouter API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/vitai.git
   cd vitai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Fill in your environment variables in `.env.local`

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── (public)/       # Public routes (landing, auth)
│   ├── (app)/          # Protected app routes
│   ├── api/            # API routes
│   └── onboarding/     # Onboarding flow
├── components/
│   ├── atoms/          # Basic UI elements
│   ├── molecules/      # Composed components
│   ├── organisms/      # Complex sections
│   └── templates/      # Page layouts
├── domain/             # Domain logic (DDD)
│   ├── user/           # User & profile
│   ├── food/           # Food items
│   ├── meal/           # Meal logging
│   └── weight/         # Weight tracking
├── lib/                # Utilities, API clients
├── hooks/              # Custom React hooks
├── types/              # TypeScript types
├── i18n/               # Internationalization
└── styles/             # Global styles & tokens
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Check TypeScript
- `npm run test` - Run tests

## License

MIT
