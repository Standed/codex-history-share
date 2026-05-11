#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
PKG_ROOT="$DIST_DIR/pkg-root"
COMPONENT_PKG="$DIST_DIR/codex-history-repair-component.pkg"
OUTPUT_PKG="$DIST_DIR/codex-history-repair-mac.pkg"
IDENTIFIER="com.standed.codex-history-share.repair"
VERSION="$(node -p "JSON.parse(require('fs').readFileSync('$ROOT_DIR/package.json','utf8')).version")"

rm -rf "$PKG_ROOT" "$COMPONENT_PKG" "$OUTPUT_PKG"
mkdir -p "$PKG_ROOT/usr/local/share/codex-history-share"

cat > "$PKG_ROOT/usr/local/share/codex-history-share/README.txt" <<'TXT'
Codex History Repair

This package installs and runs codex-history-share for the active macOS user.
TXT

pkgbuild \
  --root "$PKG_ROOT" \
  --scripts "$ROOT_DIR/installer/pkg/scripts" \
  --identifier "$IDENTIFIER" \
  --version "$VERSION" \
  --install-location / \
  "$COMPONENT_PKG"

if [ -n "${DEVELOPER_ID_INSTALLER:-}" ]; then
  productbuild --sign "$DEVELOPER_ID_INSTALLER" --package "$COMPONENT_PKG" "$OUTPUT_PKG"
else
  productbuild --package "$COMPONENT_PKG" "$OUTPUT_PKG"
fi

if [ -n "${NOTARY_PROFILE:-}" ]; then
  xcrun notarytool submit "$OUTPUT_PKG" --keychain-profile "$NOTARY_PROFILE" --wait
  xcrun stapler staple "$OUTPUT_PKG"
fi

pkgutil --check-signature "$OUTPUT_PKG" || true

echo "$OUTPUT_PKG"
