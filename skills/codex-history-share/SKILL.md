---
name: codex-history-share
description: Use when a user needs to keep Codex local sidebar history visible across API providers, proxy providers, or ChatGPT login mode; diagnose missing Codex history; sync local Codex provider metadata; export local Codex history indexes; or install the codex-history background watcher.
---

# Codex History Share

Use this skill when helping users recover or maintain Codex local sidebar history after switching `model_provider`, API proxy, or ChatGPT login mode.

## Core Commands

Prefer the `codex-history` CLI:

```bash
codex-history status
codex-history sync
codex-history export
codex-history watch
codex-history install-agent
```

If the command is missing, install it:

```bash
npm install -g git+https://github.com/Standed/codex-history-share.git
```

## Workflow

1. Run `codex-history status` and inspect provider counts, encrypted content warnings, and project visibility.
2. If old sessions are under a different provider, run `codex-history sync`.
3. Ask the user to restart Codex Desktop if the sidebar does not refresh immediately.
4. For future provider switching, run `codex-history install-agent` on macOS or keep `codex-history watch` running.
5. For a portable reference backup, run `codex-history export`.

## Safety Boundary

This tool fixes local Codex visibility metadata. It does not decrypt or re-encrypt `encrypted_content`, and it does not import ChatGPT web/app cloud chats into Codex.

Old sessions may become visible but still fail when continued under a different provider/account with `invalid_encrypted_content`. Recommend starting a new session for reliable continuation.
