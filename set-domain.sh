#!/bin/sh

set -eu

if [ "$#" -ne 1 ]; then
  echo "Usage: ./set-domain.sh https://your-domain.com"
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

find "$SITE_DIR" -type f \
  \( -name "*.html" -o -name "robots.txt" -o -name "sitemap.xml" -o -name "*.webmanifest" \) \
  -exec perl -0pi -e 's|https://example\.com|$ENV{ARROW_OUT_DOMAIN}|g' {} +

echo "Updated site URLs to $DOMAIN"
