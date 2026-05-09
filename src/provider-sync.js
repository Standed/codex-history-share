import { commandExists, run } from "./exec.js";

const PACKAGE_BIN = new URL("../node_modules/codex-provider-sync/src/cli.js", import.meta.url);

export async function ensureProviderSyncAvailable() {
  if (await commandExists("codex-provider")) {
    return { command: "codex-provider", argsPrefix: [] };
  }

  try {
    return { command: process.execPath, argsPrefix: [PACKAGE_BIN.pathname] };
  } catch {
    throw new Error(
      "Missing codex-provider. Install it first with: npm install -g git+https://github.com/Dailin521/codex-provider-sync.git"
    );
  }
}

export async function providerStatus({ codexHome } = {}) {
  const providerSync = await ensureProviderSyncAvailable();
  const args = ["status"];
  if (codexHome) {
    args.push("--codex-home", codexHome);
  }
  const { stdout } = await run(providerSync.command, [...providerSync.argsPrefix, ...args]);
  return stdout.trim();
}

export async function providerSync({ codexHome, provider, keep = 5 } = {}) {
  const providerSync = await ensureProviderSyncAvailable();
  const args = ["sync", "--keep", String(keep)];
  if (provider) {
    args.push("--provider", provider);
  }
  if (codexHome) {
    args.push("--codex-home", codexHome);
  }
  const { stdout } = await run(providerSync.command, [...providerSync.argsPrefix, ...args]);
  return stdout.trim();
}

export async function providerRestore({ codexHome, backupDir, noConfig, noDb, noSessions } = {}) {
  const providerSync = await ensureProviderSyncAvailable();
  if (!backupDir) {
    throw new Error("Missing backup path.");
  }
  const args = ["restore", backupDir];
  if (noConfig) args.push("--no-config");
  if (noDb) args.push("--no-db");
  if (noSessions) args.push("--no-sessions");
  if (codexHome) {
    args.push("--codex-home", codexHome);
  }
  const { stdout } = await run(providerSync.command, [...providerSync.argsPrefix, ...args]);
  return stdout.trim();
}
