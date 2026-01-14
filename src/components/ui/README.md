# shadcn/ui Components

This directory contains shadcn/ui components installed via the CLI.

## Installed Components

- **Button** - Versatile button component with multiple variants
- **Card** - Container component with header, content, and footer sections
- **Badge** - Small status indicators and labels
- **Input** - Form input component
- **Label** - Form label component

## Adding New Components

To add more shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

Examples:
```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
npx shadcn@latest add tabs
```

## Usage

Import components from `@/components/ui/[component-name]`:

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
```

## Documentation

Full component documentation: https://ui.shadcn.com/docs/components

## Customization

These components are fully customizable. You can:
- Modify the component files directly in this directory
- Adjust colors via CSS variables in `src/app/globals.css`
- Change the default styles in `tailwind.config.ts`
