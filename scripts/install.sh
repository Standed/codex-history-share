#!/usr/bin/env bash
set -euo pipefail

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required. Install Node.js first: https://nodejs.org/" >&2
  exit 1
fi

node_major="$(node -p "Number(process.versions.node.split('.')[0])")"
if [ "$node_major" -lt 24 ]; then
  echo "Node.js 24+ is required. Current version: $(node -v)" >&2
  echo "Install Node.js 24 LTS first: https://nodejs.org/" >&2
  exit 1
fi

npm install -g git+https://github.com/Standed/codex-history-share.git
codex-history setup

cat <<'EOF'

codex-history-share installed.

Common commands:
  codex-history setup
  codex-history status
  codex-history sync
  codex-history export
EOF
