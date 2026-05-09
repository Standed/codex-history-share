#!/usr/bin/env bash
set -euo pipefail

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required. Install Node.js first: https://nodejs.org/" >&2
  exit 1
fi

npm install -g git+https://github.com/Standed/codex-history-share.git
codex-history status

cat <<'EOF'

codex-history-share installed.

Common commands:
  codex-history sync
  codex-history watch
  codex-history export
  codex-history install-agent
EOF
