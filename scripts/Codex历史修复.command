#!/usr/bin/env bash
set -u

export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

INSTALL_URL="https://raw.githubusercontent.com/Standed/codex-history-share/main/scripts/install.sh"
NODE_URL="https://nodejs.org/"
LOG_DIR="$HOME/.codex-history-share"
LOG_FILE="$LOG_DIR/double-click-install.log"

mkdir -p "$LOG_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

clear
cat <<'BANNER'
============================================================
  Codex 历史侧边栏修复工具
============================================================

这个工具会帮你修复：
- 切换 API 后，Codex 左侧历史突然不见
- 切换账号后，本地旧会话看不到
- 中转 provider 变化后，项目历史变空

请保持这个窗口打开，等它提示完成。

BANNER

pause() {
  echo
  read -r -p "按回车键关闭这个窗口..." _
}

notify() {
  local message="$1"
  /usr/bin/osascript -e "display notification \"$message\" with title \"Codex 历史修复\"" >/dev/null 2>&1 || true
}

fail() {
  echo
  echo "没有修复成功：$1"
  echo
  echo "你可以把下面这个日志文件发给老师或助教："
  echo "$LOG_FILE"
  notify "没有修复成功，请把日志发给老师或助教"
  pause
  exit 1
}

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "检测到这台电脑还没有安装 Node.js。"
  echo
  echo "我现在会帮你打开 Node.js 官网。"
  echo "请安装 Node.js 24 LTS。安装完成后，再双击这个文件一次。"
  open "$NODE_URL" >/dev/null 2>&1 || true
  notify "请先安装 Node.js 24 LTS，然后再次双击本文件"
  pause
  exit 0
fi

node_major="$(node -p "Number(process.versions.node.split('.')[0])" 2>/dev/null || echo 0)"
if [ "$node_major" -lt 24 ]; then
  echo "检测到当前 Node.js 版本太低：$(node -v 2>/dev/null || echo unknown)"
  echo
  echo "我现在会帮你打开 Node.js 官网。"
  echo "请安装 Node.js 24 LTS。安装完成后，再双击这个文件一次。"
  open "$NODE_URL" >/dev/null 2>&1 || true
  notify "请升级到 Node.js 24 LTS，然后再次双击本文件"
  pause
  exit 0
fi

echo "Node.js 检查通过：$(node -v)"
echo
echo "开始安装并修复 Codex 历史，请稍等..."
echo

if command -v curl >/dev/null 2>&1; then
  curl -fsSL "$INSTALL_URL" | bash || fail "安装脚本执行失败"
else
  fail "系统缺少 curl，无法下载安装脚本"
fi

cat <<'DONE'

============================================================
  修复流程已经执行完成
============================================================

接下来请做两件事：

1. 完全退出 Codex Desktop
   Mac 上可以点 Codex 后按 Command + Q

2. 重新打开 Codex Desktop
   然后看左侧边栏历史是否回来了

如果还是没回来，把这个日志文件发给老师或助教：
~/.codex-history-share/double-click-install.log

DONE

notify "修复流程已完成，请退出并重新打开 Codex"
pause
