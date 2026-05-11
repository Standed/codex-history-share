#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/dist/Codex历史修复-mac"
ZIP_PATH="$ROOT_DIR/dist/Codex历史修复-mac.zip"

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

cp "$ROOT_DIR/scripts/Codex历史修复.command" "$BUILD_DIR/Codex历史修复.command"
chmod +x "$BUILD_DIR/Codex历史修复.command"

cat > "$BUILD_DIR/先看我.txt" <<'TXT'
Codex 历史侧边栏修复工具

适合不会打开 Terminal 的学员。

使用方法：

1. 双击 Codex历史修复.command

2. 如果 Mac 提示无法打开：
   右键点击 Codex历史修复.command，选择“打开”

3. 如果工具提示安装 Node.js：
   它会自动打开 Node.js 官网
   请安装 Node.js 24 LTS
   安装完以后，再双击 Codex历史修复.command 一次

4. 工具提示完成后：
   按 Command + Q 完全退出 Codex Desktop
   然后重新打开 Codex Desktop

如果还是没恢复，把这个日志发给老师或助教：
~/.codex-history-share/double-click-install.log
TXT

rm -f "$ZIP_PATH"
( cd "$ROOT_DIR/dist" && ditto -c -k --sequesterRsrc --keepParent "Codex历史修复-mac" "$ZIP_PATH" )

echo "$ZIP_PATH"
