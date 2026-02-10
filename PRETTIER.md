# Prettier Setup

This project uses Prettier for code formatting with automatic import sorting.

## Configuration

### Prettier Rules

- **Semi**: true - Always use semicolons
- **Single Quote**: false - Use double quotes
- **Print Width**: 100 - Wrap lines at 100 characters
- **Tab Width**: 2 - Use 2 spaces for indentation
- **Trailing Comma**: es5 - Add trailing commas where valid in ES5
- **Arrow Parens**: always - Always include parentheses around arrow function parameters
- **End of Line**: lf - Use Unix line endings
- **Bracket Spacing**: true - Add spaces between brackets in object literals
- **Bracket Same Line**: false - Put closing brackets on new line

### Import Sorting

Imports are automatically sorted in the following order:

1. **React imports** - `react`, `react-dom`, etc.
2. **Next.js imports** - `next`, `next/router`, etc.
3. **Third-party modules** - All other npm packages
4. **Type imports** - `@/types/*`
5. **Library imports** - `@/lib/*`
6. **Hooks** - `@/hooks/*`
7. **Components** - `@/components/*`
8. **App imports** - `@/app/*`
9. **Relative imports** - `./` and `../`

Each group is separated by a blank line for better readability.

## Usage

### Format All Files

```bash
pnpm format
```

### Check Formatting (CI/CD)

```bash
pnpm format:check
```

### Format Specific File

```bash
pnpm exec prettier --write path/to/file.ts
```

### Check Specific File

```bash
pnpm exec prettier --check path/to/file.ts
```

## VSCode Integration

The project includes VSCode settings that:

- Set Prettier as the default formatter
- Enable format on save
- Enable format on paste
- Disable VS Code's built-in organize imports (Prettier handles this)

### Recommended Extensions

Install the recommended extensions by:

1. Open Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
2. Type "Show Recommended Extensions"
3. Install the recommended extensions

Or install manually:

- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

## Pre-commit Hook ✅

The project has a pre-commit hook configured using Husky and lint-staged that automatically formats changed files before committing.

### What it does

- Runs Prettier on all staged files that match: `*.{js,jsx,ts,tsx,json,css,scss,md}`
- Automatically formats your code before each commit
- Only formats files you've changed (not the entire codebase)
- Prevents unformatted code from being committed

### Configuration

The hook is defined in:

- `.husky/pre-commit` - Contains the command to run
- `package.json` - Contains the lint-staged configuration

### Behavior

When you run `git commit`:

1. Git stages your files
2. Pre-commit hook triggers
3. Prettier formats only the staged files
4. Formatted files are automatically re-staged
5. Commit completes with formatted code

### Bypassing the hook (not recommended)

If you need to bypass the hook in an emergency:

```bash
git commit --no-verify -m "commit message"
```

## Ignored Files

The following files and directories are ignored by Prettier (see `.prettierignore`):

- `node_modules/`
- `.next/`
- `out/`
- `dist/`
- `build/`
- Lock files
- Environment files
- Generated files

## Tips

1. **Format on Save**: Enabled by default in VSCode settings
2. **Format on Paste**: Enabled by default in VSCode settings
3. **Keyboard Shortcut**: Use `Shift+Alt+F` (Windows/Linux) or `Shift+Option+F` (Mac) to format manually
4. **Status Bar**: Check the status bar in VSCode to confirm Prettier is the active formatter

## Troubleshooting

### Prettier not working in VSCode

1. Ensure the Prettier extension is installed
2. Check that `.prettierrc` exists in the project root
3. Reload VSCode window (Cmd+Shift+P → "Reload Window")
4. Check VSCode Output panel (Prettier channel) for errors

### Import sorting not working

1. Ensure `@ianvs/prettier-plugin-sort-imports` is installed
2. Check that the plugin is listed in `.prettierrc`
3. Restart VSCode or reload window
