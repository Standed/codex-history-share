# Release Notes

## v0.1.2

This release adds a beginner-friendly macOS double-click flow.

- Add `scripts/Codex历史修复.command`, a guided Chinese helper for users who cannot open Terminal.
- Add `scripts/build-mac-zip.sh` to create `Codex历史修复-mac.zip` release assets with executable permissions preserved.
- Add `docs/小白学员安装说明.md` for teachers, assistants, and students.
- Update README guidance with a non-technical user path.

## v0.1.1

This release focuses on first-run reliability for non-technical users.

- Add `codex-history setup` as the recommended one-command flow.
- Run an immediate provider sync before installing the background watcher.
- Start the macOS LaunchAgent with `bootstrap` and `kickstart`, with legacy `load` fallback.
- Make `watch` sync once on startup, then monitor file changes.
- Add a 5-minute fallback change check so missed file events still get repaired.
- Update the installer script to run `setup` automatically and give a clear Node.js 24+ error.
- Update README guidance to tell users to quit and reopen Codex Desktop after setup.

## v0.1.0

Initial public release.

- Sync Codex local history visibility metadata to the current provider.
- Watch Codex config/auth/state files and sync automatically.
- Install a macOS LaunchAgent for background watching.
- Export local Codex thread indexes as Markdown or JSON.
- Restore from `codex-provider-sync` backups.
- Include a Codex Skill for agent-assisted recovery workflows.

Desktop EXE/DMG packages are planned after the CLI behavior stabilizes.
