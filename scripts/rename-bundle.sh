#!/usr/bin/env bash
# Renombra main.<hash>.js a <prefijo>_<dd_mm_yyyy>.js y actualiza index.html.
# Uso: [BUNDLE_PREFIX=frontend_mas] scripts/rename-bundle.sh [dist/bae-frontend] [dd_mm_yyyy]
# El prefijo por defecto es frontend_pgtec (el bundle incluye todos los temas; el tema lo elige BAE_LP_THEME).
set -euo pipefail
DIR="${1:-dist/bae-frontend}"
STAMP="${2:-$(date +%d_%m_%Y)}"
NEW="${BUNDLE_PREFIX:-frontend_pgtec}_${STAMP}.js"
OLD=$(cd "$DIR" && ls main.*.js | head -n1)
[ -n "$OLD" ] || { echo "No se encontró main.*.js en $DIR" >&2; exit 1; }
mv "$DIR/$OLD" "$DIR/$NEW"
sed -i "s/$OLD/$NEW/g" "$DIR/index.html"
grep -q "$NEW" "$DIR/index.html" || { echo "index.html no referencia $NEW" >&2; exit 1; }
echo "Bundle principal: $OLD -> $NEW"
