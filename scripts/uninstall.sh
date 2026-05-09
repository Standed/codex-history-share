#!/usr/bin/env bash
set -euo pipefail

if command -v codex-history >/dev/null 2>&1; then
  codex-history uninstall-agent || true
fi

npm uninstall -g codex-history-share || true
