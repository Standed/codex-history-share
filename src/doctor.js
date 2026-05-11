import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { commandExists, run } from "./exec.js";
import { appStateDir, plistPath } from "./paths.js";
import { providerStatus } from "./provider-sync.js";
import { windowsTaskStatus } from "./windows-agent.js";

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function fileInfo(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return `${filePath} (${stat.size} bytes, modified ${stat.mtime.toISOString()})`;
  } catch {
    return `${filePath} (missing)`;
  }
}

async function macAgentStatus() {
  if (process.platform !== "darwin") return null;
  const label = "com.codex-history-share.watch";
  try {
    const { stdout } = await run("launchctl", ["print", `gui/${process.getuid()}/${label}`]);
    return stdout.trim().split("\n").slice(0, 30).join("\n");
  } catch (error) {
    return `macOS LaunchAgent not installed or not readable: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export async function runDoctor({ codexHome, json = false } = {}) {
  const keyFiles = [
    "config.toml",
    "auth.json",
    "state_5.sqlite",
    "session_index.jsonl"
  ];

  const checks = [];
  const add = (name, ok, detail = "") => checks.push({ name, ok, detail });

  const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
  add("Node.js 24+", nodeMajor >= 24, process.version);
  add("npm available", await commandExists("npm"), await commandExists("npm") ? "found" : "missing");
  add("Codex home exists", await exists(codexHome), codexHome);

  for (const file of keyFiles) {
    const filePath = path.join(codexHome, file);
    add(`Codex file: ${file}`, await exists(filePath), await fileInfo(filePath));
  }

  let providerOutput = "";
  try {
    providerOutput = await providerStatus({ codexHome });
    add("provider status", true, "ok");
  } catch (error) {
    providerOutput = error instanceof Error ? error.message : String(error);
    add("provider status", false, providerOutput);
  }

  const logFiles = [
    path.join(appStateDir(), "watch.log"),
    path.join(appStateDir(), "launchd.out.log"),
    path.join(appStateDir(), "launchd.err.log"),
    path.join(appStateDir(), "double-click-install.log"),
    "/Users/Shared/codex-history-share/pkg-install.log"
  ];

  const agentStatus = process.platform === "darwin"
    ? await macAgentStatus()
    : process.platform === "win32"
      ? await windowsTaskStatus()
      : null;

  const result = {
    platform: process.platform,
    arch: process.arch,
    home: os.homedir(),
    codexHome,
    appStateDir: appStateDir(),
    checks,
    providerOutput,
    agentStatus,
    logs: await Promise.all(logFiles.map(fileInfo))
  };

  if (json) {
    return JSON.stringify(result, null, 2);
  }

  const lines = [
    "codex-history doctor",
    "",
    `Platform: ${result.platform} ${result.arch}`,
    `Home: ${result.home}`,
    `Codex home: ${result.codexHome}`,
    `State dir: ${result.appStateDir}`,
    "",
    "Checks:"
  ];

  for (const check of checks) {
    lines.push(`  ${check.ok ? "OK" : "FAIL"} ${check.name}${check.detail ? ` - ${check.detail}` : ""}`);
  }

  lines.push("", "Provider status:", providerOutput || "(no output)");

  if (agentStatus) {
    lines.push("", "Background agent:", agentStatus);
  }

  lines.push("", "Logs:");
  for (const log of result.logs) lines.push(`  ${log}`);

  lines.push("", "If the sidebar still looks empty, fully quit and reopen Codex Desktop after setup.");
  return lines.join("\n");
}
