#!/usr/bin/env bash
# ship-staging: push staging → open/update PR → wait for checks → merge to main → sync local branches
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

COMMIT_MSG=""
SKIP_COMMIT=false
BASE_BRANCH="main"
HEAD_BRANCH="staging"

usage() {
  cat <<'EOF'
Usage: pnpm ship:staging [options] ["Commit message"]

Release workflow (staging → main):
  1. Commit uncommitted changes (unless --skip-commit)
  2. Push origin/staging
  3. Create PR to main (or reuse open PR)
  4. Wait for CI checks (Vercel, etc.)
  5. Rebase-merge PR into main (linear history, no merge commit)
  6. Pull main, reset staging to main, push staging

Staging already contains the shipped commits — after rebase-merge, main has them
with new SHAs. Reset staging to main so both branches match (no merge-back).

Options:
  --skip-commit   Fail if there are uncommitted changes instead of committing
  -h, --help      Show this help

Examples:
  pnpm ship:staging "Add feature X"
  pnpm ship:staging --skip-commit
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-commit)
      SKIP_COMMIT=true
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      COMMIT_MSG="$1"
      shift
      ;;
  esac
done

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: GitHub CLI (gh) is required." >&2
  exit 1
fi

has_changes() {
  ! git diff --quiet || ! git diff --cached --quiet || [[ -n "$(git ls-files --others --exclude-standard)" ]]
}

current_branch="$(git branch --show-current)"
if [[ "$current_branch" != "$HEAD_BRANCH" ]]; then
  echo "→ checkout $HEAD_BRANCH"
  git checkout "$HEAD_BRANCH"
fi

if has_changes; then
  if [[ "$SKIP_COMMIT" == true ]]; then
    echo "Error: uncommitted changes. Commit first or pass a commit message." >&2
    exit 1
  fi
  if [[ -z "$COMMIT_MSG" ]]; then
    echo "Error: uncommitted changes require a commit message." >&2
    usage
    exit 1
  fi
  echo "→ commit"
  git add -A
  git commit -m "$COMMIT_MSG"
fi

echo "→ push origin/$HEAD_BRANCH"
git push -u origin "$HEAD_BRANCH"

pr_number="$(gh pr list --head "$HEAD_BRANCH" --base "$BASE_BRANCH" --state open --json number --jq '.[0].number // empty')"

if [[ -z "$pr_number" ]]; then
  title="$(git log -1 --pretty=%s)"
  body="$(cat <<EOF
## Summary
$(git log "origin/${BASE_BRANCH}..HEAD" --pretty=format:'- %s' || git log -1 --pretty=format:'- %s')

## Test plan
- [ ] CI checks pass
EOF
)"
  echo "→ create PR ($HEAD_BRANCH → $BASE_BRANCH)"
  gh pr create --base "$BASE_BRANCH" --head "$HEAD_BRANCH" --title "$title" --body "$body"
  pr_number="$(gh pr list --head "$HEAD_BRANCH" --base "$BASE_BRANCH" --state open --json number --jq '.[0].number')"
else
  echo "→ reuse open PR #$pr_number"
fi

echo "→ wait for checks on PR #$pr_number"
gh pr checks "$pr_number" --watch --fail-fast

echo "→ rebase-merge PR #$pr_number into $BASE_BRANCH"
gh pr merge "$pr_number" --rebase

echo "→ update local $BASE_BRANCH"
git fetch origin "$BASE_BRANCH"
git checkout "$BASE_BRANCH"
git pull origin "$BASE_BRANCH"

echo "→ reset $HEAD_BRANCH to $BASE_BRANCH (same commits, no merge-back)"
git checkout "$HEAD_BRANCH"
git reset --hard "origin/$BASE_BRANCH"
git push --force-with-lease origin "$HEAD_BRANCH"

echo "✓ Done. PR merged (rebase). $BASE_BRANCH and $HEAD_BRANCH both at $(git rev-parse --short HEAD)."
