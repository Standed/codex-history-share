#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";

import { exportHistory } from "./export.js";
import { installLaunchAgent, uninstallLaunchAgent } from "./launch-agent.js";
import { resolveCodexHome } from "./paths.js";
import { providerRestore, providerStatus, providerSync } from "./provider-sync.js";
import { watchHistory } from "./watch.js";

function parseArgs(argv) {
  const positionals = [];
  const flags = {};

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) {
      positionals.push(value);
      continue;
    }
    const [rawName, inlineValue] = value.split("=", 2);
    const name = rawName.slice(2);
    if (inlineValue !== undefined) {
      flags[name] = inlineValue;
      continue;
    }
    const nextValue = argv[index + 1];
    if (nextValue && !nextValue.startsWith("--")) {
      flags[name] = nextValue;
      index += 1;
    } else {
      flags[name] = true;
    }
  }

  return { positionals, flags };
}

function printHelp() {
  console.log(`codex-history

Keep Codex local sidebar history visible across API providers and ChatGPT login modes.

Usage:
  codex-history status [--codex-home PATH]
  codex-history sync [--provider ID] [--keep N] [--codex-home PATH]
  codex-history watch [--keep N] [--codex-home PATH]
  codex-history export [--format both|json|md] [--out DIR] [--codex-home PATH]
  codex-history restore <backup-dir> [--no-config] [--no-db] [--no-sessions] [--codex-home PATH]
  codex-history install-agent [--keep N] [--codex-home PATH]
  codex-history uninstall-agent
`);
}

function parseKeep(value) {
  if (value === undefined) return 5;
  const keep = Number.parseInt(String(value), 10);
  if (!Number.isInteger(keep) || keep < 1) {
    throw new Error("--keep must be an integer greater than 0.");
  }
  return keep;
}

async function main() {
  const { positionals, flags } = parseArgs(process.argv.slice(2));
  const command = positionals[0];
  const codexHome = resolveCodexHome(flags["codex-home"]);

  if (!command || command === "help" || flags.help) {
    printHelp();
    return;
  }

  if (command === "status") {
    console.log(await providerStatus({ codexHome }));
    return;
  }

  if (command === "sync") {
    console.log(await providerSync({
      codexHome,
      provider: flags.provider,
      keep: parseKeep(flags.keep)
    }));
    return;
  }

  if (command === "watch") {
    await watchHistory({
      codexHome,
      keep: parseKeep(flags.keep),
      once: Boolean(flags.once)
    });
    return;
  }

  if (command === "export") {
    const result = await exportHistory({
      codexHome,
      outDir: flags.out,
      format: flags.format ?? "both"
    });
    console.log(`Exported ${result.threads} thread(s):`);
    for (const filePath of result.written) {
      console.log(`  ${filePath}`);
    }
    return;
  }

  if (command === "restore") {
    console.log(await providerRestore({
      codexHome,
      backupDir: positionals[1] ?? flags.backup,
      noConfig: Boolean(flags["no-config"]),
      noDb: Boolean(flags["no-db"]),
      noSessions: Boolean(flags["no-sessions"])
    }));
    return;
  }

  if (command === "install-agent") {
    const cliPath = fileURLToPath(import.meta.url);
    const target = await installLaunchAgent({
      codexHome,
      keep: parseKeep(flags.keep),
      nodePath: process.execPath,
      cliPath
    });
    console.log(`Installed and loaded LaunchAgent: ${target}`);
    return;
  }

  if (command === "uninstall-agent") {
    const target = await uninstallLaunchAgent();
    console.log(`Uninstalled LaunchAgent: ${target}`);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
