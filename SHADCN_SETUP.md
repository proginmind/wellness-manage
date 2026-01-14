# shadcn/ui Setup Guide

This document explains the shadcn/ui setup in this project.

## What is shadcn/ui?

shadcn/ui is a collection of beautifully designed, accessible components built with Radix UI and Tailwind CSS. Unlike traditional component libraries, shadcn/ui components are copied directly into your project, giving you full control over the code.

## Installation Summary

### 1. Dependencies Installed

```json
{
  "@radix-ui/react-label": "^2.1.8",
  "@radix-ui/react-slot": "^1.2.4",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "lucide-react": "^0.562.0",
  "tailwind-merge": "^3.4.0"
}
```

### 2. Configuration Files

#### `components.json`
Configuration file for shadcn/ui CLI:
- Style: "new-york"
- Base color: "zinc"
- CSS variables: enabled
- TypeScript: enabled
- React Server Components: enabled

#### `tailwind.config.ts`
Tailwind configuration with shadcn/ui color system using CSS variables.

#### `src/app/globals.css`
CSS variables for light and dark themes with shadcn/ui color palette.

#### `src/lib/utils.ts`
Contains the `cn()` utility function for merging Tailwind classes.

### 3. Components Installed

Located in `src/components/ui/`:

1. **Button** (`button.tsx`)
   - Variants: default, destructive, outline, secondary, ghost, link
   - Sizes: default, sm, lg, icon

2. **Card** (`card.tsx`)
   - Components: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter

3. **Badge** (`badge.tsx`)
   - Variants: default, secondary, destructive, outline

4. **Input** (`input.tsx`)
   - Standard form input with styling

5. **Label** (`label.tsx`)
   - Form label component

## Usage Examples

### Button Component

```tsx
import { Button } from "@/components/ui/button";

// Default button
<Button>Click me</Button>

// Variants
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Ghost</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>
```

### Card Component

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Form Components

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter your email" />
</div>
```

### Badge Component

```tsx
import { Badge } from "@/components/ui/badge";

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

## Adding More Components

To add additional shadcn/ui components:

```bash
# Add a single component
npx shadcn@latest add dialog

# Add multiple components
npx shadcn@latest add dialog dropdown-menu select

# List all available components
npx shadcn@latest add
```

Popular components to add:
- `dialog` - Modal dialogs
- `dropdown-menu` - Dropdown menus
- `select` - Select inputs
- `tabs` - Tab navigation
- `toast` - Toast notifications
- `form` - Form components with validation
- `table` - Data tables
- `sheet` - Slide-over panels
- `popover` - Popover components
- `alert-dialog` - Confirmation dialogs

## Customization

### Changing Colors

Edit `src/app/globals.css` to change the color scheme:

```css
:root {
  --primary: 240 5.9% 10%;
  --secondary: 240 4.8% 95.9%;
  /* ... other colors */
}
```

### Modifying Components

Since components are in your project, you can modify them directly:

1. Open the component file in `src/components/ui/`
2. Make your changes
3. The changes apply immediately

### Creating Variants

Use `class-variance-authority` (cva) to add new variants:

```tsx
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "...",
        custom: "your-custom-classes",
      },
    },
  }
);
```

## Dark Mode

Dark mode is configured using CSS variables. Toggle dark mode by adding the `dark` class to the `<html>` element:

```tsx
// In your layout or theme provider
<html className={isDark ? "dark" : ""}>
```

## Utility Function

The `cn()` function in `src/lib/utils.ts` merges Tailwind classes intelligently:

```tsx
import { cn } from "@/lib/utils";

<Button className={cn("custom-class", isActive && "active-class")} />
```

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Component Examples](https://ui.shadcn.com/examples)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)

## Troubleshooting

### Components not styled correctly

1. Ensure `src/app/globals.css` is imported in your root layout
2. Check that `tailwind.config.ts` includes the correct content paths
3. Verify CSS variables are defined in `globals.css`

### Import errors

Make sure path aliases are configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Type errors

Install required type definitions:

```bash
pnpm add -D @types/node @types/react @types/react-dom
```
