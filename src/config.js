import fs from "node:fs/promises";
import path from "node:path";

export async function readCurrentProvider(codexHome) {
  const configPath = path.join(codexHome, "config.toml");
  let text = "";
  try {
    text = await fs.readFile(configPath, "utf8");
  } catch {
    return "openai";
  }

  const match = text.match(/^\s*model_provider\s*=\s*["']?([^"'\n#]+)["']?/m);
  return match?.[1]?.trim() || "openai";
}
