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

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;

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

async function readWatchFingerprint(codexHome) {
  const parts = [];
  for (const file of WATCH_FILES) {
    const filePath = path.join(codexHome, file);
    try {
      const stat = await fsp.stat(filePath);
      parts.push(`${file}:${stat.size}:${Math.trunc(stat.mtimeMs)}`);
    } catch {
      parts.push(`${file}:missing`);
    }
  }
  return parts.join("|");
}

export async function watchHistory({
  codexHome,
  keep = 5,
  debounceMs = 1500,
  intervalMs = DEFAULT_INTERVAL_MS,
  initialSync = true,
  once = false
} = {}) {
  let currentProvider = await readCurrentProvider(codexHome);
  await appendLog(`watch started for ${codexHome}; provider=${currentProvider}`);
  console.log(`Watching ${codexHome}`);
  console.log(`Current provider: ${currentProvider}`);

  let timer = null;
  let syncing = false;
  let pending = false;
  let fingerprint = await readWatchFingerprint(codexHome);

  async function runSync(reason, { force = false } = {}) {
    if (syncing) {
      pending = true;
      return;
    }

    syncing = true;
    try {
      await sleep(250);
      const nextProvider = await readCurrentProvider(codexHome);
      if (force || nextProvider !== currentProvider || reason === "manual" || reason === "sqlite") {
        console.log(`[${new Date().toLocaleTimeString()}] Syncing history to provider ${nextProvider} (${reason})`);
        await appendLog(`sync start provider=${nextProvider} reason=${reason}`);
        const output = await providerSync({ codexHome, provider: nextProvider, keep });
        await appendLog(`sync complete\n${output}`);
        currentProvider = nextProvider;
        fingerprint = await readWatchFingerprint(codexHome);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      await appendLog(`sync failed: ${message}`);
    } finally {
      syncing = false;
      if (pending) {
        pending = false;
        runSync("pending", { force: true });
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
    await runSync("manual", { force: true });
    for (const watcher of watchers) watcher.close();
    return;
  }

  if (initialSync) {
    await runSync("startup", { force: true });
  }

  const interval = setInterval(() => {
    readWatchFingerprint(codexHome)
      .then((nextFingerprint) => {
        if (nextFingerprint !== fingerprint) {
          fingerprint = nextFingerprint;
          runSync("interval-change", { force: true });
        }
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        appendLog(`interval check failed: ${message}`);
      });
  }, intervalMs);

  process.on("SIGINT", async () => {
    clearInterval(interval);
    for (const watcher of watchers) watcher.close();
    await appendLog("watch stopped");
    process.exit(0);
  });
}
