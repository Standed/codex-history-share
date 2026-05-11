import { fileURLToPath } from "node:url";

import { installLaunchAgent, uninstallLaunchAgent } from "./launch-agent.js";
import { installWindowsTask, uninstallWindowsTask } from "./windows-agent.js";

export async function installBackgroundAgent({ codexHome, keep, nodePath = process.execPath, cliPath = fileURLToPath(new URL("./cli.js", import.meta.url)) }) {
  if (process.platform === "darwin") {
    return {
      type: "macos-launchagent",
      target: await installLaunchAgent({ codexHome, keep, nodePath, cliPath })
    };
  }

  if (process.platform === "win32") {
    return {
      type: "windows-scheduled-task",
      target: await installWindowsTask({ codexHome, keep, nodePath, cliPath })
    };
  }

  return {
    type: "manual-watch",
    target: "codex-history watch"
  };
}

export async function uninstallBackgroundAgent() {
  if (process.platform === "darwin") {
    return {
      type: "macos-launchagent",
      target: await uninstallLaunchAgent()
    };
  }

  if (process.platform === "win32") {
    return {
      type: "windows-scheduled-task",
      target: await uninstallWindowsTask()
    };
  }

  return {
    type: "manual-watch",
    target: "No automatic background agent is installed for this platform."
  };
}
