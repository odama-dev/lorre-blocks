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
import {
  detectPackageManager,
  installDependencies,
} from "../utils/package-manager"
import { resolveBaseDir, rewriteImports, targetDirForType } from "../utils/paths"
import { fetchRegistryItem, fetchTheme } from "../utils/registry"
import { injectThemeBlock } from "../utils/css"

export interface InitOptions {
  cwd: string
  registry?: string
  yes?: boolean
}

const BASE_DEPENDENCIES = [
  "clsx",
  "tailwind-merge",
  "class-variance-authority",
  "tw-animate-css",
]

const GLOBAL_CSS_CANDIDATES = [
  "src/app/globals.css",
  "app/globals.css",
  "src/index.css",
  "src/styles/globals.css",
  "styles/globals.css",
]

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
    (options.yes ? DEFAULT_REGISTRY : await promptText("Registry URL", DEFAULT_REGISTRY))

  const config: Config = {
    $schema: "https://lorre-blocks.dev/schema.json",
    registry,
    tsx,
    aliases: { ...DEFAULT_ALIASES },
  }

  await writeConfig(cwd, config)
  p.log.success("Wrote components.json")

  const pm = await detectPackageManager(cwd)
  const depSpinner = p.spinner()
  depSpinner.start(`Installing base dependencies with ${pm}`)
  try {
    await installDependencies(cwd, pm, BASE_DEPENDENCIES)
    depSpinner.stop(`Installed: ${BASE_DEPENDENCIES.join(", ")}`)
  } catch (err) {
    depSpinner.stop("Dependency install failed.")
    p.cancel((err as Error).message)
    process.exit(1)
  }

  const baseDir = await resolveBaseDir(cwd)

  try {
    const utils = await fetchRegistryItem(registry, "utils")
    for (const file of utils.files) {
      const dir = targetDirForType(file.type, config.aliases, baseDir)
      await fs.mkdir(dir, { recursive: true })
      const dest = path.join(dir, path.basename(file.path))
      await fs.writeFile(dest, rewriteImports(file.content, config), "utf8")
      p.log.success(`Wrote ${path.relative(cwd, dest)}`)
    }
  } catch (err) {
    p.log.warn(`Could not write utils: ${(err as Error).message}`)
  }

  try {
    const themeCss = await fetchTheme(registry)
    const cssPath = await resolveGlobalCss(cwd)
    const existing = await readIfExists(cssPath)
    const next = injectThemeBlock(existing ?? "", themeCss)
    await fs.mkdir(path.dirname(cssPath), { recursive: true })
    await fs.writeFile(cssPath, next, "utf8")
    p.log.success(
      `${existing === null ? "Created" : "Updated"} ${path.relative(cwd, cssPath)} with the theme`
    )
  } catch (err) {
    p.log.warn(`Could not set up the theme: ${(err as Error).message}`)
  }

  p.outro(
    `${color.green("✔")} Ready. Now run ${color.cyan("lorre-blocks add button")}.`
  )
}

async function resolveGlobalCss(cwd: string): Promise<string> {
  for (const candidate of GLOBAL_CSS_CANDIDATES) {
    if (await fileExists(path.join(cwd, candidate))) {
      return path.join(cwd, candidate)
    }
  }
  return path.join(cwd, GLOBAL_CSS_CANDIDATES[0])
}

async function readIfExists(file: string): Promise<string | null> {
  try {
    return await fs.readFile(file, "utf8")
  } catch {
    return null
  }
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
