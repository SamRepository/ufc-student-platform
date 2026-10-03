#!/usr/bin/env sh
# Smoke test a running site: health, release identifier, key pages, search index, 404 and headers.
# Usage: scripts/ci/smoke.sh <base-url> [expected-commit]
set -eu

BASE="${1%/}"
EXPECTED="${2:-}"
fail() { echo "✗ $*" >&2; exit 1; }
status() { curl -s -o /dev/null -w '%{http_code}' "$BASE$1"; }

for path in /health/live /health/ready /ar/ /fr/ /en/ /ar/modules/lean-startup/ /en/modules/english-business-plans/ /ar/search/ /search-index.json; do
  code=$(status "$path")
  [ "$code" = "200" ] || fail "$path returned $code"
  echo "✓ $path 200"
done

code=$(status /ar/this-page-does-not-exist/)
[ "$code" = "404" ] || fail "unknown page returned $code, expected 404"
echo "✓ unknown page 404"

release=$(curl -fsS "$BASE/release.json")
commit=$(printf '%s' "$release" | sed -n 's/.*"commit":"\([^"]*\)".*/\1/p')
resources=$(printf '%s' "$release" | sed -n 's/.*"resources":\([0-9]*\).*/\1/p')
[ -n "$commit" ] || fail "release.json has no commit"
if [ -n "$EXPECTED" ] && [ "$commit" != "$EXPECTED" ]; then fail "serving commit $commit, expected $EXPECTED"; fi
[ "${resources:-0}" -gt 0 ] || fail "release.json reports no public resources"
echo "✓ release $commit ($resources public resources)"

home=$(curl -fsS "$BASE/ar/")
printf '%s' "$home" | grep -q 'lang="ar" dir="rtl"' || fail "/ar/ is not served as Arabic RTL"
echo "✓ /ar/ is Arabic RTL"

headers=$(curl -sSI "$BASE/ar/")
printf '%s' "$headers" | grep -qi '^content-security-policy:' || fail "missing Content-Security-Policy header"
printf '%s' "$headers" | grep -qi '^x-content-type-options: nosniff' || fail "missing X-Content-Type-Options header"
echo "✓ security headers present"

echo "Smoke test passed for $BASE"
