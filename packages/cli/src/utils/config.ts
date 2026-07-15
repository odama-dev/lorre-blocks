import { promises as fs } from "node:fs"
import path from "node:path"

export const CONFIG_FILE = "components.json"

export const DEFAULT_REGISTRY = "https://lorre-blocks.vercel.app"

export interface Aliases {
  components: string
  ui: string
  lib: string
  hooks: string
  utils: string
}

export interface Config {
  $schema?: string
  registry: string
  tsx: boolean
  /** Active Lorre theme name (e.g. "odama"). Set by init / theme apply. */
  theme?: string
  aliases: Aliases
}

/**
 * The theme `init` starts a new project on — the house theme.
 *
 * Distinct from ROOT_THEME on purpose: this is a *preference* and may change
 * again, whereas ROOT_THEME is a fact about the registry's shape.
 */
export const DEFAULT_THEME = "odama"

/**
 * Root of the `extends` chain, and the only theme a registry without a themes
 * index can serve (it answers on the legacy /r/theme.json endpoint).
 *
 * Also what a config predating the `theme` field means: those projects were
 * themed basic, so resolving them to anything else would silently re-theme
 * them on the next command.
 */
export const ROOT_THEME = "basic"

export const DEFAULT_ALIASES: Aliases = {
  components: "@/components",
  ui: "@/components/ui",
  lib: "@/lib",
  hooks: "@/hooks",
  utils: "@/lib/utils",
}

export function configPath(cwd: string): string {
  return path.join(cwd, CONFIG_FILE)
}

export async function configExists(cwd: string): Promise<boolean> {
  try {
    await fs.access(configPath(cwd))
    return true
  } catch {
    return false
  }
}

export async function readConfig(cwd: string): Promise<Config | null> {
  try {
    const raw = await fs.readFile(configPath(cwd), "utf8")
    return JSON.parse(raw) as Config
  } catch {
    return null
  }
}

export async function writeConfig(cwd: string, config: Config): Promise<void> {
  await fs.writeFile(
    configPath(cwd),
    JSON.stringify(config, null, 2) + "\n",
    "utf8"
  )
}
