# CLAUDE.md

## Project Overview

GoutCare is an AI-powered gout management app that helps patients track purine intake, monitor uric acid levels, log flares, and analyze food photos using Claude's vision API. It runs as a Next.js web app wrapped with Capacitor for iOS deployment, with a parallel native SwiftUI iOS app.

## Tech Stack

- **Web**: Next.js 14 (App Router), React 18, TypeScript 5 (strict mode)
- **Mobile**: Capacitor 8 (iOS primary), native SwiftUI app in `/ios/App/App/`
- **AI**: Anthropic SDK (`@anthropic-ai/sdk`) using Claude Sonnet for food image analysis
- **Styling**: CSS custom properties in `globals.css` (no CSS-in-JS)
- **Charts**: Recharts
- **Deployment**: Vercel (web), App Store (iOS)

## Commands

```bash
npm run dev           # Start dev server (localhost:3000)
npm run build         # Production build (web)
npm run build:mobile  # Static export for Capacitor (sets CAPACITOR_BUILD=true)
npm run lint          # Next.js linter
npm start             # Start production server
```

No test framework is configured.

## Project Structure

- `src/app/` — Next.js pages and API routes (App Router)
- `src/components/` — React components (modals, nav, icons)
- `src/lib/` — Utilities, types, storage abstraction, purine database, platform detection
- `src/hooks/` — Custom React hooks (usePlatform, useStorage, useSubscription, useTheme)
- `ios/App/App/` — Native SwiftUI iOS app (17 Swift files)
- `public/` — Static assets
- `out/` — Static export output for mobile builds

## Key API Endpoint

`src/app/api/analyze/route.ts` — POST endpoint that accepts base64-encoded food images, sends them to Claude for analysis, and returns structured JSON with purine levels, risk factors, and alternatives.

## Code Conventions

- **Imports**: Use `@/` path alias (maps to `src/`)
- **Components**: Functional components with hooks; named exports for components, default exports for pages
- **Naming**: camelCase for variables/functions, PascalCase for types/components, UPPER_SNAKE_CASE for constants, kebab-case for CSS variables
- **Types**: Defined in `src/lib/types.ts`; use `import type` for type-only imports
- **Platform**: Use `isNative()`, `isIOS()`, `isAndroid()`, `isWeb()` from `src/lib/platform.ts`
- **Storage**: Use the abstraction in `src/lib/storage.ts` (wraps localStorage with SSR safety)
- **Capacitor plugins**: Lazy-imported via `await import(...)`
- **CSS**: Dark-first theme with light mode override; use existing CSS variables from `globals.css`
- **Swift**: SwiftUI with `@State`, `@EnvironmentObject`, `@MainActor` patterns

## Environment

Requires `ANTHROPIC_API_KEY` in `.env.local` (see `.env.example`).
