import { promises as fs } from "node:fs"
import path from "node:path"
import * as p from "@clack/prompts"
import color from "picocolors"

import {
  Config,
  DEFAULT_ALIASES,
  DEFAULT_REGISTRY,
  configExists,
  writeConfig,
} from "../utils/config"

export interface InitOptions {
  cwd: string
  registry?: string
  yes?: boolean
}

export async function runInit(options: InitOptions): Promise<void> {
  const { cwd } = options

  p.intro(color.bgCyan(color.black(" lorre-blocks init ")))

  if (await configExists(cwd)) {
    const overwrite = options.yes
      ? true
      : await p.confirm({
          message: "components.json already exists. Overwrite it?",
          initialValue: false,
        })
    if (p.isCancel(overwrite) || !overwrite) {
      p.cancel("Init aborted; existing components.json kept.")
      return
    }
  }

  const tsx = await fileExists(path.join(cwd, "tsconfig.json"))

  const registry =
    options.registry ??
    (options.yes
      ? DEFAULT_REGISTRY
      : await promptText(
          "Registry URL",
          DEFAULT_REGISTRY
        ))

  const config: Config = {
    $schema: "https://lorre-blocks.dev/schema.json",
    registry,
    tsx,
    aliases: { ...DEFAULT_ALIASES },
  }

  await writeConfig(cwd, config)

  p.outro(
    `${color.green("✔")} Wrote components.json. Now run ${color.cyan(
      "lorre-blocks add button"
    )}.`
  )
}

async function promptText(message: string, initial: string): Promise<string> {
  const value = await p.text({ message, placeholder: initial, defaultValue: initial })
  if (p.isCancel(value)) {
    p.cancel("Init cancelled.")
    process.exit(0)
  }
  return (value as string) || initial
}

async function fileExists(f: string): Promise<boolean> {
  try {
    await fs.access(f)
    return true
  } catch {
    return false
  }
}
