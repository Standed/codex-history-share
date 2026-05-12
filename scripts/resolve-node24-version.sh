#!/usr/bin/env bash
set -euo pipefail
python3 - <<'PY'
import json
import urllib.request
with urllib.request.urlopen('https://nodejs.org/dist/index.json', timeout=30) as response:
    versions = json.load(response)
for item in versions:
    version = item.get('version', '')
    if version.startswith('v24.'):
        print(version)
        break
else:
    raise SystemExit('No Node.js v24 release found')
PY
