import { spawn } from "node:child_process";

export function run(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        NODE_OPTIONS: [
          process.env.NODE_OPTIONS,
          "--no-warnings"
        ].filter(Boolean).join(" ")
      },
      ...options
    });
    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, code });
        return;
      }
      const error = new Error(`${command} ${args.join(" ")} failed with exit code ${code}\n${stderr || stdout}`);
      error.stdout = stdout;
      error.stderr = stderr;
      error.code = code;
      reject(error);
    });
  });
}

export async function commandExists(command) {
  try {
    await run("which", [command]);
    return true;
  } catch {
    return false;
  }
}
