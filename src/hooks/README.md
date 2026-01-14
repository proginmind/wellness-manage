# Hooks

This directory contains custom React hooks.

## Files

- `useLocalStorage.ts` - Hook for managing localStorage with React state

## Usage

```typescript
'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';

function MyComponent() {
  const [value, setValue] = useLocalStorage('key', 'defaultValue');
  // ...
}
```

## Guidelines

- All hooks must follow the "use" naming convention
- Mark client-side hooks with 'use client' directive
- Include TypeScript types for better DX
