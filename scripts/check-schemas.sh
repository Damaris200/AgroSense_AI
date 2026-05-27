#!/usr/bin/env bash
# Verify every Prisma schema has `url = env("DATABASE_URL")`.
# The Prisma 7 VS Code extension keeps stripping this line (because Prisma 7
# moved url out of the schema). We pin Prisma 6.19 because v7 doesn't support
# MongoDB yet, and v6 REQUIRES the url line. Without it, `prisma generate`
# fails and Docker builds die.
#
# Run this:
#   - Manually:  bash scripts/check-schemas.sh
#   - Pre-commit hook (see scripts/install-hooks.sh)
#   - Jenkins pipeline early-fail stage

set -euo pipefail

repo_root=$(cd "$(dirname "$0")/.." && pwd)
fail=0

for schema in "$repo_root"/services/*/prisma/schema.prisma; do
  service=$(basename "$(dirname "$(dirname "$schema")")")
  if ! grep -q 'env("DATABASE_URL")' "$schema"; then
    echo "FAIL: $service is missing 'url = env(\"DATABASE_URL\")'"
    fail=1
  else
    echo "OK:   $service"
  fi
done

if [ "$fail" -ne 0 ]; then
  cat <<MSG

One or more Prisma schemas lost the 'url' line. Restore it with:

  for f in services/*/prisma/schema.prisma; do
    grep -q 'env("DATABASE_URL")' "\$f" \\
      || sed -i.bak '/^\s*provider\s*=/a\  url      = env("DATABASE_URL")' "\$f"
  done

Then run this script again to confirm, and commit the fix.
MSG
  exit 1
fi

echo ""
echo "All 7 schemas pass."
