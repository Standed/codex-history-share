#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
CACHE_DIR="$ROOT_DIR/.cache/node-runtime"
NODE_VERSION="${NODE_VERSION:-$(bash "$ROOT_DIR/scripts/resolve-node24-version.sh")}" 
APP_DIR="$DIST_DIR/embedded-app"
MAC_ROOT="$DIST_DIR/embedded-mac-root"
MAC_PKG_COMPONENT="$DIST_DIR/codex-history-repair-embedded-mac-component.pkg"
MAC_PKG="$DIST_DIR/codex-history-repair-embedded-mac.pkg"
WIN_DIR="$DIST_DIR/codex-history-repair-embedded-windows"
WIN_ZIP="$DIST_DIR/codex-history-repair-embedded-windows.zip"
IDENTIFIER="com.standed.codex-history-share.embedded"
VERSION="$(node -p "JSON.parse(require('fs').readFileSync('$ROOT_DIR/package.json','utf8')).version")"

mkdir -p "$DIST_DIR" "$CACHE_DIR"

fetch_node() {
  local platform="$1"
  local ext="$2"
  local file="node-${NODE_VERSION}-${platform}.${ext}"
  local url="https://nodejs.org/dist/${NODE_VERSION}/${file}"
  local target="$CACHE_DIR/$file"
  if [ ! -f "$target" ]; then
    echo "Downloading $url" >&2
    curl -fL "$url" -o "$target"
  fi
  echo "$target"
}

extract_tar_node() {
  local platform="$1"
  local out_name="$2"
  local archive
  archive="$(fetch_node "$platform" "tar.gz")"
  rm -rf "$DIST_DIR/$out_name"
  mkdir -p "$DIST_DIR/$out_name"
  tar -xzf "$archive" --strip-components=1 -C "$DIST_DIR/$out_name"
}

extract_zip_node() {
  local platform="$1"
  local out_name="$2"
  local archive
  archive="$(fetch_node "$platform" "zip")"
  rm -rf "$DIST_DIR/$out_name"
  mkdir -p "$DIST_DIR/$out_name"
  unzip -q "$archive" -d "$DIST_DIR/tmp-node"
  local extracted
  extracted="$(find "$DIST_DIR/tmp-node" -maxdepth 1 -type d -name "node-${NODE_VERSION}-${platform}" | head -1)"
  mv "$extracted"/* "$DIST_DIR/$out_name/"
  rm -rf "$DIST_DIR/tmp-node"
}

build_app_dir() {
  rm -rf "$APP_DIR"
  mkdir -p "$APP_DIR"
  rsync -a \
    --exclude .git \
    --exclude .github \
    --exclude .cache \
    --exclude dist \
    --exclude node_modules/.cache \
    --exclude '*.tgz' \
    "$ROOT_DIR/" "$APP_DIR/"
}

build_app_dir
extract_tar_node "darwin-arm64" "node-darwin-arm64"
extract_tar_node "darwin-x64" "node-darwin-x64"
extract_zip_node "win-x64" "node-win-x64"

rm -rf "$MAC_ROOT" "$MAC_PKG_COMPONENT" "$MAC_PKG"
mkdir -p "$MAC_ROOT/usr/local/share/codex-history-share/app" "$MAC_ROOT/usr/local/share/codex-history-share/runtime"
rsync -a "$APP_DIR/" "$MAC_ROOT/usr/local/share/codex-history-share/app/"
rsync -a "$DIST_DIR/node-darwin-arm64" "$MAC_ROOT/usr/local/share/codex-history-share/runtime/"
rsync -a "$DIST_DIR/node-darwin-x64" "$MAC_ROOT/usr/local/share/codex-history-share/runtime/"

pkgbuild \
  --root "$MAC_ROOT" \
  --scripts "$ROOT_DIR/installer/pkg-embedded/scripts" \
  --identifier "$IDENTIFIER" \
  --version "$VERSION" \
  --install-location / \
  "$MAC_PKG_COMPONENT"

if [ -n "${DEVELOPER_ID_INSTALLER:-}" ]; then
  productbuild --sign "$DEVELOPER_ID_INSTALLER" --package "$MAC_PKG_COMPONENT" "$MAC_PKG"
else
  productbuild --package "$MAC_PKG_COMPONENT" "$MAC_PKG"
fi

if [ -n "${NOTARY_PROFILE:-}" ]; then
  xcrun notarytool submit "$MAC_PKG" --keychain-profile "$NOTARY_PROFILE" --wait
  xcrun stapler staple "$MAC_PKG"
fi

rm -rf "$WIN_DIR" "$WIN_ZIP"
mkdir -p "$WIN_DIR/app" "$WIN_DIR/runtime"
rsync -a "$APP_DIR/" "$WIN_DIR/app/"
rsync -a "$DIST_DIR/node-win-x64" "$WIN_DIR/runtime/"
cp "$ROOT_DIR/installer/windows-embedded/CodexHistoryRepair-Windows.cmd" "$WIN_DIR/"
cp "$ROOT_DIR/installer/windows-embedded/CodexHistoryRepair-Windows.ps1" "$WIN_DIR/"
cat > "$WIN_DIR/README.txt" <<'TXT'
Codex History Repair Embedded for Windows

This package includes Node.js runtime.
You do not need to install Node.js or Git.

1. Double-click CodexHistoryRepair-Windows.cmd
2. If Windows SmartScreen appears, click More info, then Run anyway
3. After it finishes, fully quit and reopen Codex Desktop

Logs:
%USERPROFILE%\.codex-history-share\windows-embedded-install.log
%USERPROFILE%\.codex-history-share\doctor.txt
TXT

( cd "$DIST_DIR" && zip -qr "$WIN_ZIP" "codex-history-repair-embedded-windows" )

ls -lh "$MAC_PKG" "$WIN_ZIP"
