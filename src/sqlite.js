import fs from "node:fs/promises";
import path from "node:path";

import { run } from "./exec.js";

export async function readThreads(codexHome) {
  const dbPath = path.join(codexHome, "state_5.sqlite");
  try {
    await fs.access(dbPath);
  } catch {
    return [];
  }

  const query = `
      SELECT
        id,
        title,
        first_user_message,
        model_provider,
        model,
        reasoning_effort,
        cwd,
        rollout_path,
        archived,
        created_at,
        updated_at,
        created_at_ms,
        updated_at_ms,
        cli_version,
        source
      FROM threads
      ORDER BY COALESCE(updated_at_ms, updated_at * 1000) DESC
    `;
  const { stdout } = await run("sqlite3", ["-json", dbPath, query]);
  return JSON.parse(stdout || "[]");
}
