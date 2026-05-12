$ErrorActionPreference = "Stop"

$SourceDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$InstallDir = Join-Path $env:LOCALAPPDATA "CodexHistoryShare"
$StateDir = Join-Path $env:USERPROFILE ".codex-history-share"
$LogFile = Join-Path $StateDir "windows-embedded-install.log"

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
Write-Host "This embedded package does not require Node.js, Git, or Terminal."
Write-Host "Please keep this window open until it finishes."
Write-Host ""

Say "Installing local runtime to $InstallDir ..."
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
Copy-Item -Recurse -Force (Join-Path $SourceDir "app") $InstallDir
Copy-Item -Recurse -Force (Join-Path $SourceDir "runtime") $InstallDir

$Node = Join-Path $InstallDir "runtime\node-win-x64\node.exe"
$Cli = Join-Path $InstallDir "app\src\cli.js"

if (-not (Test-Path $Node)) {
  Finish "Bundled Node runtime is missing. Send this log to your teacher: $LogFile"
}
if (-not (Test-Path $Cli)) {
  Finish "Repair tool files are missing. Send this log to your teacher: $LogFile"
}

Say "Running repair setup..."
& $Node $Cli setup
if ($LASTEXITCODE -ne 0) {
  Finish "Repair failed. Send this log to your teacher: $LogFile"
}

Say "Running diagnostics..."
& $Node $Cli doctor | Tee-Object -FilePath (Join-Path $StateDir "doctor.txt")

Finish "Repair finished. Please fully quit and reopen Codex Desktop, then check the left sidebar. If it still fails, send this log to your teacher: $LogFile"
