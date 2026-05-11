# Release Notes

## v0.1.4

This release adds a macOS `.pkg` installer flow, which is the preferred path for non-technical students.

- Add `scripts/build-mac-pkg.sh` to build `codex-history-repair-mac.pkg`.
- Add a package `postinstall` script that runs the repair for the active macOS user.
- Support optional Developer ID Installer signing via `DEVELOPER_ID_INSTALLER`.
- Support optional notarization via `NOTARY_PROFILE`.
- Update beginner docs to recommend the `.pkg` installer over the `.command` zip fallback.

## v0.1.3

This release uses an ASCII release asset filename so GitHub does not mangle the downloadable zip name.

- Rename the macOS release asset to `codex-history-repair-mac.zip`.
- Keep the extracted folder and double-click helper in Chinese for student readability.
- Update README and student instructions with the stable asset name.

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
