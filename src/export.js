import fs from "node:fs/promises";
import path from "node:path";

import { defaultExportDir } from "./paths.js";
import { readThreads } from "./sqlite.js";

function formatDate(secondsOrMs) {
  if (!secondsOrMs) return "";
  const value = Number(secondsOrMs);
  const ms = value > 10_000_000_000 ? value : value * 1000;
  return new Date(ms).toISOString();
}

function escapeMarkdownCell(value) {
  return String(value ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("\n", " ")
    .trim();
}

function summarizeThread(thread) {
  return {
    id: thread.id,
    title: thread.title,
    firstUserMessage: thread.first_user_message,
    provider: thread.model_provider,
    model: thread.model,
    reasoningEffort: thread.reasoning_effort,
    cwd: thread.cwd,
    rolloutPath: thread.rollout_path,
    archived: Boolean(thread.archived),
    createdAt: formatDate(thread.created_at_ms || thread.created_at),
    updatedAt: formatDate(thread.updated_at_ms || thread.updated_at),
    cliVersion: thread.cli_version,
    source: thread.source
  };
}

function renderMarkdown(threads) {
  const lines = [
    "# Codex History Export",
    "",
    `Exported at: ${new Date().toISOString()}`,
    `Threads: ${threads.length}`,
    "",
    "| Updated | Title | Provider | Project | Archived |",
    "| --- | --- | --- | --- | --- |"
  ];

  for (const thread of threads) {
    lines.push([
      escapeMarkdownCell(thread.updatedAt),
      escapeMarkdownCell(thread.title || thread.firstUserMessage || thread.id),
      escapeMarkdownCell(thread.provider),
      escapeMarkdownCell(thread.cwd),
      thread.archived ? "yes" : "no"
    ].join(" | ").replace(/^/, "| ").replace(/$/, " |"));
  }

  lines.push("");
  lines.push("## Details");
  for (const thread of threads) {
    lines.push("");
    lines.push(`### ${thread.title || thread.id}`);
    lines.push("");
    lines.push(`- ID: \`${thread.id}\``);
    lines.push(`- Updated: ${thread.updatedAt || "(unknown)"}`);
    lines.push(`- Provider: \`${thread.provider || "(missing)"}\``);
    lines.push(`- Model: \`${thread.model || "(unknown)"}\``);
    lines.push(`- Project: \`${thread.cwd || "(unknown)"}\``);
    lines.push(`- Rollout: \`${thread.rolloutPath || "(unknown)"}\``);
    if (thread.firstUserMessage) {
      lines.push("");
      lines.push("First user message:");
      lines.push("");
      lines.push("```text");
      lines.push(thread.firstUserMessage.slice(0, 4000));
      lines.push("```");
    }
  }

  return `${lines.join("\n")}\n`;
}

export async function exportHistory({ codexHome, outDir, format = "both" }) {
  const targetDir = path.resolve(outDir ?? defaultExportDir(codexHome));
  await fs.mkdir(targetDir, { recursive: true });

  const threads = (await readThreads(codexHome)).map(summarizeThread);
  const timestamp = new Date().toISOString().replaceAll(":", "").replaceAll(".", "");
  const written = [];

  if (format === "json" || format === "both") {
    const jsonPath = path.join(targetDir, `codex-history-${timestamp}.json`);
    await fs.writeFile(jsonPath, `${JSON.stringify({ exportedAt: new Date().toISOString(), threads }, null, 2)}\n`);
    written.push(jsonPath);
  }

  if (format === "md" || format === "markdown" || format === "both") {
    const markdownPath = path.join(targetDir, `codex-history-${timestamp}.md`);
    await fs.writeFile(markdownPath, renderMarkdown(threads));
    written.push(markdownPath);
  }

  return { threads: threads.length, written };
}
