import { promises as fs } from "node:fs"
import path from "node:path"

const GLOBAL_CSS_CANDIDATES = [
  "src/app/globals.css",
  "app/globals.css",
  "src/index.css",
  "src/styles/globals.css",
  "styles/globals.css",
]

/** Locate the project's global stylesheet; defaults to the first candidate when none exists. */
export async function resolveGlobalCss(cwd: string): Promise<string> {
  for (const candidate of GLOBAL_CSS_CANDIDATES) {
    const full = path.join(cwd, candidate)
    try {
      await fs.access(full)
      return full
    } catch {
      continue
    }
  }
  return path.join(cwd, GLOBAL_CSS_CANDIDATES[0])
}

export async function readIfExists(file: string): Promise<string | null> {
  try {
    return await fs.readFile(file, "utf8")
  } catch {
    return null
  }
}
