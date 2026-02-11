# Components

This directory contains reusable React components.

## Structure

- Place shared components directly in this folder
- For complex components with multiple files, create a subfolder
- Export components from index files for cleaner imports

## Example

```tsx
// Usage in other files
import { Header } from "@/components/Header";

// components/Header/index.tsx
export { Header } from "./Header";
```
