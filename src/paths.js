import os from "node:os";
import path from "node:path";

export function defaultCodexHome() {
  return path.join(os.homedir(), ".codex");
}

export function resolveCodexHome(explicitCodexHome) {
  return path.resolve(explicitCodexHome ?? process.env.CODEX_HOME ?? defaultCodexHome());
}

export function appStateDir() {
  return path.join(os.homedir(), ".codex-history-share");
}

export function defaultExportDir(codexHome) {
  return path.join(codexHome, "exports", "history-share");
}

export function plistPath() {
  return path.join(os.homedir(), "Library", "LaunchAgents", "com.codex-history-share.watch.plist");
}
