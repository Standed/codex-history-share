# codex-history-share

[中文文档](README_ZH.md)

Keep Codex local sidebar history visible when you switch between API providers, proxy providers, and ChatGPT login mode.

This project wraps the proven low-level repair logic from [`codex-provider-sync`](https://github.com/Dailin521/codex-provider-sync) and adds the missing product layer:

- `sync`: make local Codex history visible under the current provider.
- `watch`: monitor provider/auth/config changes and sync automatically.
- `export`: write a portable Markdown/JSON index of local Codex threads.
- `install-agent`: install a macOS LaunchAgent so syncing keeps running in the background.
- `restore`: restore from the backups created by the underlying sync tool.

## Why this exists

Codex stores local history with provider metadata. After switching `model_provider`, old sessions can disappear from the desktop sidebar or `/resume`, even though the files still exist.

This tool makes the sidebar metadata follow your current provider so the same local history remains visible.

## Important boundary

This does not decrypt or re-encrypt `encrypted_content`.

Old sessions that were created under another account/provider can usually be made visible again, but continuing or compacting them may still fail with `invalid_encrypted_content`. Treat those sessions as readable history, and start a new session when you need reliable continuation under a new provider.

It also does not import ChatGPT web/app cloud chats into Codex. It works with local Codex history in `~/.codex`.

## Install

Requires Node.js 24+.

From GitHub:

```bash
npm install -g git+https://github.com/Standed/codex-history-share.git
codex-history status
```

Or with the installer script:

```bash
curl -fsSL https://raw.githubusercontent.com/Standed/codex-history-share/main/scripts/install.sh | bash
```

## Commands

```bash
codex-history status
codex-history sync
codex-history watch
codex-history export
codex-history install-agent
codex-history uninstall-agent
codex-history restore ~/.codex/backups_state/provider-sync/<timestamp>
```

## Typical Use

After switching API provider or ChatGPT login mode:

```bash
codex-history sync
```

To keep it automatic:

```bash
codex-history install-agent
```

Logs are written to:

```text
~/.codex-history-share/watch.log
~/.codex-history-share/launchd.out.log
~/.codex-history-share/launchd.err.log
```

## Export

```bash
codex-history export
```

By default exports are written to:

```text
~/.codex/exports/history-share
```

The export is an index of local threads: title, provider, model, project path, first user message, and rollout path. It is a backup/reference format, not an import format.

## Safety

Every `sync` uses `codex-provider-sync`, which creates backups in:

```text
~/.codex/backups_state/provider-sync
```

If something looks wrong, restore the latest backup:

```bash
codex-history restore ~/.codex/backups_state/provider-sync/<timestamp>
```

## Codex Skill

The repo includes a skill at:

```text
skills/codex-history-share
```

Copy that folder into your Codex skills directory if you want agents to automatically follow the recovery workflow.
