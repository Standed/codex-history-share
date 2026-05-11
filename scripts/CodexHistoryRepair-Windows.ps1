$ErrorActionPreference = "Stop"

$ReleaseBase = "https://github.com/Standed/codex-history-share/releases/latest/download"
$PackageUrl = "$ReleaseBase/codex-history-share.tgz"
$NodeUrl = "https://nodejs.org/"
$StateDir = Join-Path $env:USERPROFILE ".codex-history-share"
$LogFile = Join-Path $StateDir "windows-install.log"

New-Item -ItemType Directory -Force -Path $StateDir | Out-Null
Start-Transcript -Path $LogFile -Append | Out-Null

function Say($Text) {
  Write-Host ""
  Write-Host $Text
}

function Finish($Text) {
  Say $Text
  Stop-Transcript | Out-Null
  exit 0
}

Clear-Host
Write-Host "============================================================"
Write-Host "  Codex History Repair for Windows"
Write-Host "============================================================"
Write-Host ""
Write-Host "This tool repairs missing Codex sidebar history after switching API/account/provider."
Write-Host "Please keep this window open until it finishes."
Write-Host ""

$node = Get-Command node -ErrorAction SilentlyContinue
$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $node -or -not $npm) {
  Say "Node.js is not installed. Opening Node.js website..."
  Start-Process $NodeUrl
  Finish "Please install Node.js 24 LTS, then double-click this repair tool again."
}

$nodeVersion = (& node -p "process.versions.node")
$nodeMajor = [int]($nodeVersion.Split('.')[0])
if ($nodeMajor -lt 24) {
  Say "Node.js is too old: v$nodeVersion"
  Start-Process $NodeUrl
  Finish "Please install Node.js 24 LTS, then double-click this repair tool again."
}

Say "Node.js OK: v$nodeVersion"

$tmp = Join-Path $env:TEMP "codex-history-share.tgz"
Say "Downloading codex-history-share package..."
Invoke-WebRequest -Uri $PackageUrl -OutFile $tmp -UseBasicParsing

Say "Installing codex-history-share..."
npm install -g $tmp

Say "Running repair setup..."
codex-history setup

Say "Running diagnostics..."
codex-history doctor | Tee-Object -FilePath (Join-Path $StateDir "doctor.txt")

Finish "Repair finished. Please fully quit and reopen Codex Desktop, then check the left sidebar. If it still fails, send this log to your teacher: $LogFile"
