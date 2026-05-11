import path from "node:path";

import { run } from "./exec.js";
import { appStateDir } from "./paths.js";

const TASK_NAME = "CodexHistoryShareWatch";

function quoteForTask(value) {
  return `"${String(value).replaceAll('"', '\\"')}"`;
}

export async function installWindowsTask({ codexHome, nodePath, cliPath, keep = 5 }) {
  if (process.platform !== "win32") {
    throw new Error("installWindowsTask supports Windows only.");
  }

  const command = [
    quoteForTask(nodePath),
    quoteForTask(cliPath),
    "watch",
    "--codex-home",
    quoteForTask(codexHome),
    "--keep",
    String(keep)
  ].join(" ");

  await run("schtasks", [
    "/Create",
    "/SC",
    "ONLOGON",
    "/TN",
    TASK_NAME,
    "/TR",
    command,
    "/F"
  ]);

  await run("schtasks", ["/Run", "/TN", TASK_NAME]).catch(() => null);
  return TASK_NAME;
}

export async function uninstallWindowsTask() {
  if (process.platform !== "win32") {
    throw new Error("uninstallWindowsTask supports Windows only.");
  }

  await run("schtasks", ["/End", "/TN", TASK_NAME]).catch(() => null);
  await run("schtasks", ["/Delete", "/TN", TASK_NAME, "/F"]).catch(() => null);
  return TASK_NAME;
}

export async function windowsTaskStatus() {
  if (process.platform !== "win32") return null;

  try {
    const { stdout } = await run("schtasks", ["/Query", "/TN", TASK_NAME, "/FO", "LIST", "/V"]);
    return stdout.trim();
  } catch (error) {
    return `Windows task not installed or not readable: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export function windowsLogHint() {
  return path.join(appStateDir(), "watch.log");
}
