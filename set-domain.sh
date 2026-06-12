#!/bin/sh

set -eu

if [ "$#" -ne 1 ]; then
  echo "Usage: ./set-domain.sh https://your-project.pages.dev"
  exit 1
fi

DOMAIN="$1"
case "$DOMAIN" in
  https://*) ;;
  *)
    echo "Domain must start with https://"
    exit 1
    ;;
esac

DOMAIN="${DOMAIN%/}"
SITE_DIR="$(cd "$(dirname "$0")/site" && pwd)"
export ARROW_OUT_DOMAIN="$DOMAIN"
CURRENT_DOMAIN="$(
  perl -ne 'if (/<link rel="canonical" href="(https:\/\/[^"]+)\/"/) { print $1; exit }' \
    "$SITE_DIR/index.html"
)"
export ARROW_OUT_CURRENT_DOMAIN="${CURRENT_DOMAIN:-https://example.com}"

find "$SITE_DIR" -type f \
  \( -name "*.html" -o -name "robots.txt" -o -name "sitemap.xml" -o -name "*.webmanifest" \) \
  -exec perl -0pi -e 's|\Q$ENV{ARROW_OUT_CURRENT_DOMAIN}\E|$ENV{ARROW_OUT_DOMAIN}|g; s|https://example\.com|$ENV{ARROW_OUT_DOMAIN}|g' {} +

echo "Updated site URLs to $DOMAIN"
