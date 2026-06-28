---
name: ship-staging
description: >-
  Ship staging to main: commit, push, open/reuse PR, wait for CI, rebase-merge,
  sync branches. Use when the user says ship, release, merge staging to main, or
  run pnpm ship:staging.
---

# Ship staging → main

Release workflow for this repo. **Only run when the user explicitly asks to ship.**

## Prerequisites

- `gh` CLI authenticated
- On `staging` (script checks out `staging` if needed)
- Follow `git-commits.mdc` for commit/PR attribution (no Cursor attribution unless approved)

## Choose the command

**Uncommitted changes + user approved commit message:**

```bash
pnpm ship:staging "Commit message here"
```

**Already committed:**

```bash
pnpm ship:staging --skip-commit
```

Script: `scripts/ship-staging.sh`

## What the script does

1. Commit (unless `--skip-commit`)
2. Push `origin/staging`
3. Create PR to `main` or reuse open PR
4. Wait for CI (`gh pr checks --watch`)
5. Rebase-merge PR into `main`
6. Fetch `main`, reset local `main` to `origin/main`
7. Reset `staging` to `origin/main`, force-push `staging`

After rebase-merge, `main` has new SHAs. `staging` is reset to match — no merge-back.

## Before running

1. `git status` — know what's committed vs not
2. If user said "ship" but changes are uncommitted: propose commit message per `git-commits.mdc`, get approval, then ship with message **or** commit first and use `--skip-commit`
3. If meaningful product/doc work shipped: update `docs/PROJECT_STATE.md` (move active → completed, refresh "Last updated")

## After success

Report to the user:

- PR URL and number
- Merged commit SHA on `main`
- CI result (pass/fail)
- Confirm `main` and `staging` are aligned

## If the script fails after PR merge

Common failure: script exits during local branch sync even though PR merged.

**Recover:**

```bash
git fetch origin
git checkout main && git reset --hard origin/main
git checkout staging && git reset --hard origin/main
git push --force-with-lease origin staging
```

Then verify with `git log --oneline -3` and `git status`.

## Do not

- Run ship without explicit user request
- Force-push `main`
- Skip CI wait unless user asks
- Add Cursor / "Made with Cursor" text to commits or PRs
