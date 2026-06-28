---
name: open-pr
description: >-
  Open a pull request without merging: commit and push if needed, create or reuse
  a PR, return the URL. Use when the user says create pr, open pr, make a pr, or
  pr to main without shipping or merging.
---

# Open PR (no merge)

Create a pull request for review. **Does not merge, ship, or sync branches.**

Only run when the user explicitly asks to create/open a PR. For full release (merge to `main`), use the `ship-staging` skill instead.

## Default in this repo

| Head      | Base   | Typical use                          |
| --------- | ------ | ------------------------------------ |
| `staging` | `main` | Integration PR before release        |
| feature   | `main` | Direct feature PR (less common here) |

Confirm head/base from `git branch --show-current` and user intent if unclear.

## Prerequisites

- `gh` CLI authenticated
- Follow `git-commits.mdc` (no Cursor attribution unless approved)

## Workflow

### 1. Gather context (parallel)

```bash
git status
git diff
git diff --staged
git branch -vv
git log --oneline -5
git diff main...HEAD   # or staging...HEAD — use the PR base branch
```

### 2. Commit and push (if needed)

- **Uncommitted changes:** propose commit message per `git-commits.mdc`, wait for approval, then commit
- **Unpushed commits:** push only when user asked for PR (creating a PR implies push)

```bash
git push -u origin HEAD
```

### 3. Reuse or create PR

Check for an existing open PR:

```bash
gh pr list --head <head-branch> --base <base-branch> --state open
```

If one exists, report its URL — do not create a duplicate unless the user asks to replace it.

### 4. Create PR

Draft title and body from **all commits** on the branch (not just the latest). Show title/body to the user first if they did not supply exact text.

```bash
gh pr create --base main --head staging --title "Title" --body "$(cat <<'EOF'
## Summary
- ...

## Test plan
- [ ] ...

EOF
)"
```

Adjust `--base` and `--head` to match the branches in step 1.

### 5. Report

Return:

- PR URL and number
- Head → base branches
- Short summary of what's included

Optionally mention CI will run on the PR — do **not** wait for checks or merge unless asked.

## Before running

- Distinguish **open PR** vs **ship**: user wants review only → this skill; user wants merge to `main` → `ship-staging` skill
- If meaningful work is included: consider updating `docs/PROJECT_STATE.md`

## Do not

- Merge the PR (`gh pr merge`) unless the user explicitly asks to ship/merge
- Run `pnpm ship:staging` as part of this workflow
- Force-push without explicit user request
- Add Cursor attribution to PR title/body
