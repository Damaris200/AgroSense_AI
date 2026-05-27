#!/usr/bin/env bash
# Install local git hooks for AgroSense AI.
# Run once after cloning the repo:
#
#   bash scripts/install-hooks.sh
#
# Currently installs:
#   - pre-commit: blocks any commit that strips `url = env("DATABASE_URL")` from
#     a Prisma schema. The Prisma 7 VS Code extension does this on save; without
#     this hook, you only find out when Jenkins / Docker build fails 10 min later.

set -euo pipefail

repo_root=$(cd "$(dirname "$0")/.." && pwd)
hooks_dir="$repo_root/.git/hooks"

if [ ! -d "$hooks_dir" ]; then
  echo "ERROR: $hooks_dir does not exist. Are you in a git repo?"
  exit 1
fi

cat > "$hooks_dir/pre-commit" <<'HOOK'
#!/usr/bin/env bash
# Auto-installed by scripts/install-hooks.sh
# Refuses to commit Prisma schemas that are missing `url = env("DATABASE_URL")`.

set -e

# Only check schema files that are part of this commit
staged_schemas=$(git diff --cached --name-only --diff-filter=ACM | grep 'prisma/schema\.prisma$' || true)

if [ -z "$staged_schemas" ]; then
  exit 0
fi

fail=0
while IFS= read -r f; do
  if ! grep -q 'env("DATABASE_URL")' "$f"; then
    echo "ERROR: $f is missing 'url = env(\"DATABASE_URL\")'"
    echo "       Add it back inside the datasource block, then re-stage and re-commit."
    fail=1
  fi
done <<< "$staged_schemas"

if [ "$fail" -ne 0 ]; then
  echo ""
  echo "Commit blocked. Run 'bash scripts/check-schemas.sh' to see all bad schemas."
  exit 1
fi
HOOK

chmod +x "$hooks_dir/pre-commit"
echo "Installed: $hooks_dir/pre-commit"
echo ""
echo "Test it: try committing a schema with the url line removed. The hook will block it."
