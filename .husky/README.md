# Git Hooks

This directory contains Git hooks managed by Husky.

## Active Hooks

### pre-commit

Runs before every commit to ensure code quality.

**What it does:**

- Formats staged files with Prettier
- Organizes imports automatically
- Ensures consistent code style

**Configuration:**

- Hook: `.husky/pre-commit`
- Staged files config: `lint-staged` in `package.json`

## Troubleshooting

### Hook not running

1. Ensure Husky is installed: `pnpm install`
2. Run the prepare script: `pnpm prepare`
3. Check that `.git/hooks` contains symlinks to `.husky`

### Hook failing

1. Check the error message in the terminal
2. Try manually running: `pnpm exec lint-staged`
3. Ensure all dependencies are installed

### Bypass hook (emergency only)

```bash
git commit --no-verify -m "your message"
```

⚠️ **Warning:** Only bypass the hook when absolutely necessary. Unformatted code may cause issues for other developers.
