#!/usr/bin/env bash
# Renombra main.<hash>.js a frontend_pgtec_<dd_mm_yyyy>.js y actualiza index.html.
# Uso: scripts/rename-bundle.sh [dist/bae-frontend] [dd_mm_yyyy]
set -euo pipefail
DIR="${1:-dist/bae-frontend}"
STAMP="${2:-$(date +%d_%m_%Y)}"
NEW="frontend_pgtec_${STAMP}.js"
OLD=$(cd "$DIR" && ls main.*.js | head -n1)
[ -n "$OLD" ] || { echo "No se encontró main.*.js en $DIR" >&2; exit 1; }
mv "$DIR/$OLD" "$DIR/$NEW"
sed -i "s/$OLD/$NEW/g" "$DIR/index.html"
grep -q "$NEW" "$DIR/index.html" || { echo "index.html no referencia $NEW" >&2; exit 1; }
echo "Bundle principal: $OLD -> $NEW"
