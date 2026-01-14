# Types

This directory contains TypeScript type definitions and interfaces.

## Structure

- `index.ts` - Global type definitions shared across the application
- Create specific type files for domains (e.g., `user.ts`, `api.ts`)

## Usage

```typescript
import type { User, ApiResponse } from '@/types';
```

## Guidelines

- Prefer interfaces over types for object shapes
- Use type aliases for unions and complex types
- Export all types for reusability
