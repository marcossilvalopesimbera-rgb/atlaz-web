# ATLAZ

ATLAZ is a production-ready foundation for a scalable investigation platform built with Next.js, React, TypeScript, Tailwind CSS, and the Next.js App Router.

## Architecture Goals

- Production-grade setup from day one
- Clean architecture with reusable UI primitives
- Absolute imports and clear domain separation
- Minimal pages scaffolded to support future features
- No business logic or fake data in this initial foundation

## Folder Structure

- `app/` — Next.js App Router pages, layouts, and route-level UI
- `components/` — shared UI components and design system primitives
- `components/ui/` — reusable layout and presentation components
- `lib/` — reusable helpers, configuration, and shared utilities
- `types/` — application types and domain contracts
- `hooks/` — shared React hooks and client-side behavior patterns
- `services/` — application service interfaces and service orchestration
- `public/` — static assets and public files
- `docs/` — architecture notes, onboarding, and process documentation
- `styles/` — global styles and CSS entrypoints

## Pages

- `/` — Home
- `/new` — New Investigation
- `/context` — Context Building
- `/workspace` — Workspace

## Getting Started

```bash
npm install
npm run dev
```

## Project Decisions

- **Next.js 15** with App Router for modern routing and layout composition.
- **TypeScript** with strict settings for type safety across the codebase.
- **Tailwind CSS** for scalable design and fast iteration with utility-first styling.
- **ESLint** via `eslint-config-next` to keep code quality aligned with Next.js best practices.
- **Absolute imports** configured through `tsconfig.json` for predictable module resolution.
- **Minimal pages only** to avoid premature business logic and keep the foundation clean.

## Next Steps

1. Add domain-specific state management and services.
2. Expand UI primitives and design system tokens.
3. Implement API layer and backend integration patterns.
4. Add tests and CI configuration.
