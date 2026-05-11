#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/dist/codex-history-repair-windows"
ZIP_PATH="$ROOT_DIR/dist/codex-history-repair-windows.zip"

rm -rf "$BUILD_DIR" "$ZIP_PATH"
mkdir -p "$BUILD_DIR"

cp "$ROOT_DIR/scripts/CodexHistoryRepair-Windows.cmd" "$BUILD_DIR/CodexHistoryRepair-Windows.cmd"
cp "$ROOT_DIR/scripts/CodexHistoryRepair-Windows.ps1" "$BUILD_DIR/CodexHistoryRepair-Windows.ps1"

cat > "$BUILD_DIR/README.txt" <<'TXT'
Codex History Repair for Windows

1. Double-click CodexHistoryRepair-Windows.cmd
2. If Windows SmartScreen appears, click More info, then Run anyway
3. If Node.js is missing, install Node.js 24 LTS, then run this again
4. After it finishes, fully quit and reopen Codex Desktop

If it still fails, send this file to your teacher:
%USERPROFILE%\.codex-history-share\windows-install.log
TXT

( cd "$ROOT_DIR/dist" && zip -qr "$ZIP_PATH" "codex-history-repair-windows" )

echo "$ZIP_PATH"
