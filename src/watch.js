import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

import { readCurrentProvider } from "./config.js";
import { appStateDir } from "./paths.js";
import { providerSync } from "./provider-sync.js";

const WATCH_FILES = [
  "auth.json",
  "config.toml",
  "state_5.sqlite",
  "session_index.jsonl"
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function appendLog(message) {
  await fsp.mkdir(appStateDir(), { recursive: true });
  await fsp.appendFile(
    path.join(appStateDir(), "watch.log"),
    `[${new Date().toISOString()}] ${message}\n`
  );
}

export async function watchHistory({ codexHome, keep = 5, debounceMs = 1500, once = false } = {}) {
  let currentProvider = await readCurrentProvider(codexHome);
  await appendLog(`watch started for ${codexHome}; provider=${currentProvider}`);
  console.log(`Watching ${codexHome}`);
  console.log(`Current provider: ${currentProvider}`);

  let timer = null;
  let syncing = false;
  let pending = false;

  async function runSync(reason) {
    if (syncing) {
      pending = true;
      return;
    }

    syncing = true;
    try {
      await sleep(250);
      const nextProvider = await readCurrentProvider(codexHome);
      if (nextProvider !== currentProvider || reason === "manual" || reason === "sqlite") {
        console.log(`[${new Date().toLocaleTimeString()}] Syncing history to provider ${nextProvider} (${reason})`);
        await appendLog(`sync start provider=${nextProvider} reason=${reason}`);
        const output = await providerSync({ codexHome, provider: nextProvider, keep });
        await appendLog(`sync complete\n${output}`);
        currentProvider = nextProvider;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      await appendLog(`sync failed: ${message}`);
    } finally {
      syncing = false;
      if (pending) {
        pending = false;
        runSync("pending");
      }
    }
  }

  function schedule(reason) {
    clearTimeout(timer);
    timer = setTimeout(() => runSync(reason), debounceMs);
  }

  const watchers = [];
  for (const file of WATCH_FILES) {
    const filePath = path.join(codexHome, file);
    try {
      await fsp.access(filePath);
      watchers.push(fs.watch(filePath, { persistent: true }, () => {
        schedule(file === "state_5.sqlite" ? "sqlite" : file);
      }));
    } catch {
      // Some Codex installs may not have every file yet.
    }
  }

  if (once) {
    await runSync("manual");
    for (const watcher of watchers) watcher.close();
    return;
  }

  process.on("SIGINT", async () => {
    for (const watcher of watchers) watcher.close();
    await appendLog("watch stopped");
    process.exit(0);
  });
}
