#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

rm -rf dist
mkdir -p dist

npm pack --pack-destination dist
TARBALL="$(ls dist/codex-history-share-*.tgz | tail -1)"
cp "$TARBALL" dist/codex-history-share.tgz

npm run build:mac-pkg
npm run build:mac-zip
npm run build:windows-zip

ls -lh dist/codex-history-share.tgz dist/codex-history-repair-mac.pkg dist/codex-history-repair-mac.zip dist/codex-history-repair-windows.zip
