# Project Structure Overview

This document provides a comprehensive overview of the Wellness Manage project structure.

## Directory Structure

```
wellness-manage/
├── public/                    # Static assets (images, fonts, etc.)
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── src/                       # Source code directory
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API routes
│   │   │   └── health/       # Health check endpoint
│   │   │       └── route.ts
│   │   ├── favicon.ico       # App favicon
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout component
│   │   └── page.tsx          # Home page
│   │
│   ├── components/           # Reusable React components
│   │   └── README.md         # Component guidelines
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useLocalStorage.ts
│   │   └── README.md
│   │
│   ├── lib/                  # Utility functions and helpers
│   │   ├── constants.ts      # Application constants
│   │   ├── utils.ts          # Utility functions
│   │   └── README.md
│   │
│   ├── types/                # TypeScript type definitions
│   │   ├── index.ts          # Global types
│   │   └── README.md
│   │
│   └── styles/               # Additional styles (if needed)
│
├── .gitignore                # Git ignore rules
├── eslint.config.mjs         # ESLint configuration
├── next.config.ts            # Next.js configuration
├── next-env.d.ts             # Next.js TypeScript declarations
├── package.json              # Project dependencies and scripts
├── package-lock.json         # Dependency lock file
├── postcss.config.mjs        # PostCSS configuration
├── README.md                 # Project documentation
├── tsconfig.json             # TypeScript configuration
└── PROJECT_STRUCTURE.md      # This file
```

## Key Features

### 1. Next.js App Router (src/app/)
- **Modern routing:** File-system based routing with App Router
- **Server Components:** React Server Components by default
- **API Routes:** Backend endpoints in `src/app/api/`
- **Layouts:** Shared layouts with `layout.tsx`

### 2. TypeScript Configuration
- **Strict mode:** Enabled for better type safety
- **Path aliases:** `@/*` maps to `src/*`
- **Modern target:** ES2017 with ESNext modules

### 3. Tailwind CSS
- **Version 4:** Latest Tailwind CSS with PostCSS
- **Dark mode:** Built-in dark mode support
- **Utility-first:** Rapid UI development

### 4. Project Organization

#### Components (`src/components/`)
Place all reusable UI components here. For complex components:
```
components/
├── Header/
│   ├── Header.tsx
│   ├── Header.test.tsx
│   └── index.ts
```

#### Hooks (`src/hooks/`)
Custom React hooks for shared logic:
- Must start with "use" prefix
- Include TypeScript types
- Mark client-side hooks with 'use client'

#### Library (`src/lib/`)
Utility functions and helpers:
- `utils.ts` - General utilities (formatDate, sleep, etc.)
- `constants.ts` - App-wide constants

#### Types (`src/types/`)
TypeScript type definitions:
- Global types in `index.ts`
- Domain-specific types in separate files

## Import Aliases

Use the `@/` alias for cleaner imports:

```typescript
// ✅ Good
import { formatDate } from '@/lib/utils';
import { User } from '@/types';
import { Button } from '@/components/Button';

// ❌ Avoid
import { formatDate } from '../../../lib/utils';
```

## Available Scripts

```bash
pnpm dev          # Start development server (localhost:3000)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint errors automatically
pnpm type-check   # Check TypeScript types without emitting
```

## API Routes

API routes are located in `src/app/api/`:

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
```

Access at: `http://localhost:3000/api/health`

## Environment Variables

Create `.env.local` for local development:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

- Prefix with `NEXT_PUBLIC_` for client-side access
- Never commit `.env.local` (already in .gitignore)
- Use `.env.example` for documentation

## Best Practices

1. **File Naming:**
   - Components: PascalCase (e.g., `Button.tsx`)
   - Utilities: camelCase (e.g., `formatDate.ts`)
   - Pages: lowercase (e.g., `page.tsx`, `layout.tsx`)

2. **Component Structure:**
   - One component per file
   - Export as default for pages
   - Named exports for components

3. **Type Safety:**
   - Define interfaces for props
   - Use `type` for unions and aliases
   - Avoid `any` - use `unknown` if needed

4. **Styling:**
   - Use Tailwind utility classes
   - Avoid inline styles
   - Use dark mode variants (`dark:`)

## Next Steps

1. **Add Components:** Create reusable UI components in `src/components/`
2. **Add Pages:** Create new routes in `src/app/`
3. **Add API Routes:** Build backend endpoints in `src/app/api/`
4. **Configure Database:** Add database connection in `src/lib/db.ts`
5. **Add Authentication:** Implement auth in `src/lib/auth.ts`

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)
