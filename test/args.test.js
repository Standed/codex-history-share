import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

test("help renders core commands", async () => {
  const { stdout } = await execFileAsync("node", ["./src/cli.js", "help"], {
    cwd: new URL("..", import.meta.url)
  });

  assert.match(stdout, /codex-history setup/);
  assert.match(stdout, /codex-history status/);
  assert.match(stdout, /codex-history watch/);
  assert.match(stdout, /codex-history export/);
});
