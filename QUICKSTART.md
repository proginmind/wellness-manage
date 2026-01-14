# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

### 2. Project Structure

```
src/
├── app/              # Pages & API routes
│   ├── page.tsx     # Home page (edit this!)
│   ├── layout.tsx   # Root layout
│   └── api/         # Backend endpoints
├── components/      # Reusable UI components
├── hooks/           # Custom React hooks
├── lib/             # Utilities & helpers
└── types/           # TypeScript types
```

### 3. Start Building

#### Create a New Page

```bash
# Create src/app/about/page.tsx
```

```typescript
export default function About() {
  return <div>About Page</div>;
}
```

Access at: `http://localhost:3000/about`

#### Create an API Route

```bash
# Create src/app/api/users/route.ts
```

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ users: [] });
}
```

Access at: `http://localhost:3000/api/users`

#### Add a Component

```bash
# Create src/components/Header.tsx
```

```typescript
export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 shadow">
      <nav className="container mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold">My App</h1>
      </nav>
    </header>
  );
}
```

Use it:

```typescript
import Header from '@/components/Header';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
```

## 📝 Useful Commands

```bash
npm run dev         # Start dev server
npm run build       # Build for production
npm run start       # Run production build
npm run lint        # Check code quality
npm run lint:fix    # Auto-fix lint issues
npm run type-check  # Check TypeScript types
```

## 💡 Tips

1. **Import Aliases:** Use `@/` instead of relative paths
   ```typescript
   import { formatDate } from '@/lib/utils';  // ✅ Good
   import { formatDate } from '../lib/utils'; // ❌ Avoid
   ```

2. **Server vs Client Components:**
   - By default, components are Server Components
   - Add `'use client'` at the top for client-side features (hooks, events)

3. **Dark Mode:** Use `dark:` prefix for dark mode styles
   ```typescript
   <div className="bg-white dark:bg-gray-900">
   ```

4. **Environment Variables:**
   - Create `.env.local` for secrets
   - Use `NEXT_PUBLIC_` prefix for client-side variables

## 📚 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🎯 Next Steps

1. Edit `src/app/page.tsx` to customize the home page
2. Add your first component in `src/components/`
3. Create API routes in `src/app/api/`
4. Add custom hooks in `src/hooks/`
5. Define types in `src/types/`

Happy coding! 🎉
