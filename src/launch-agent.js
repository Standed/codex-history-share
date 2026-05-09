import fs from "node:fs/promises";
import path from "node:path";

import { run } from "./exec.js";
import { appStateDir, plistPath } from "./paths.js";

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

export async function installLaunchAgent({ codexHome, nodePath, cliPath, keep = 5 }) {
  if (process.platform !== "darwin") {
    throw new Error("install-agent currently supports macOS LaunchAgents only.");
  }

  await fs.mkdir(path.dirname(plistPath()), { recursive: true });
  await fs.mkdir(appStateDir(), { recursive: true });

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.codex-history-share.watch</string>
  <key>ProgramArguments</key>
  <array>
    <string>${xmlEscape(nodePath)}</string>
    <string>${xmlEscape(cliPath)}</string>
    <string>watch</string>
    <string>--codex-home</string>
    <string>${xmlEscape(codexHome)}</string>
    <string>--keep</string>
    <string>${xmlEscape(keep)}</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>${xmlEscape(path.join(appStateDir(), "launchd.out.log"))}</string>
  <key>StandardErrorPath</key>
  <string>${xmlEscape(path.join(appStateDir(), "launchd.err.log"))}</string>
</dict>
</plist>
`;

  const targetPlistPath = plistPath();
  await fs.writeFile(targetPlistPath, plist);
  await run("launchctl", ["unload", targetPlistPath]).catch(() => null);
  await run("launchctl", ["load", targetPlistPath]);
  return targetPlistPath;
}

export async function uninstallLaunchAgent() {
  if (process.platform !== "darwin") {
    throw new Error("uninstall-agent currently supports macOS LaunchAgents only.");
  }

  const targetPlistPath = plistPath();
  await run("launchctl", ["unload", targetPlistPath]).catch(() => null);
  await fs.rm(targetPlistPath, { force: true });
  return targetPlistPath;
}
