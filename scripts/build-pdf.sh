#!/usr/bin/env bash
# Rebuild assets/pdf/Jake_Lasslett-CV.pdf from index.html using its print styles,
# so the "Download Resume" file always matches the page. Re-run after editing the CV.
# Needs python3 and playwright-cli on PATH.
set -euo pipefail

repo=$(cd "$(dirname "$0")/.." && pwd)
out="$repo/assets/pdf/Jake_Lasslett-CV.pdf"
port=8097
work=$(mktemp -d)

python3 -m http.server "$port" --bind 127.0.0.1 --directory "$repo" >/dev/null 2>&1 &
server=$!
cleanup() {
  (cd "$work" && playwright-cli -s=cv-pdf close >/dev/null 2>&1) || true
  kill "$server" 2>/dev/null || true
  rm -rf "$work"
}
trap cleanup EXIT
sleep 1

# playwright-cli writes snapshot files to the current directory, so run it from a temp dir
cd "$work"
playwright-cli -s=cv-pdf open "http://127.0.0.1:$port/" >/dev/null
playwright-cli -s=cv-pdf run-code "async page => {
  await page.emulateMedia({ media: 'print' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: '$out', preferCSSPageSize: true, printBackground: true });
}" >/dev/null

echo "Wrote $out"
