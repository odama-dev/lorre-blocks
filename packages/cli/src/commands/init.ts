import { promises as fs } from "node:fs"
import path from "node:path"
import * as p from "@clack/prompts"
import color from "picocolors"

import {
  Config,
  DEFAULT_ALIASES,
  DEFAULT_REGISTRY,
  DEFAULT_THEME,
  configExists,
  writeConfig,
} from "../utils/config"
import {
  detectPackageManager,
  installDependencies,
} from "../utils/package-manager"
import { resolveBaseDir, rewriteImports, targetDirForType } from "../utils/paths"
import {
  fetchRegistryItem,
  fetchThemeCss,
  fetchThemesIndex,
} from "../utils/registry"
import { injectThemeBlock } from "../utils/css"
import { readIfExists, resolveGlobalCss } from "../utils/global-css"
import * as out from "../utils/output"

export interface InitOptions {
  cwd: string
  registry?: string
  theme?: string
  yes?: boolean
}

const BASE_DEPENDENCIES = [
  "clsx",
  "tailwind-merge",
  "class-variance-authority",
  "tw-animate-css",
]

export async function runInit(options: InitOptions): Promise<void> {
  const { cwd } = options
  // JSON mode is non-interactive by definition: never block an agent on stdin.
  const nonInteractive = options.yes || out.isJsonMode()

  out.intro(color.bgCyan(color.black(" lorre-blocks init ")))

  if (await configExists(cwd)) {
    const overwrite = nonInteractive
      ? true
      : await p.confirm({
          message: "components.json already exists. Overwrite it?",
          initialValue: false,
        })
    if (p.isCancel(overwrite) || !overwrite) {
      out.fail("Init aborted; existing components.json kept.")
    }
  }

  const tsx = await fileExists(path.join(cwd, "tsconfig.json"))

  const registry =
    options.registry ??
    (nonInteractive ? DEFAULT_REGISTRY : await promptText("Registry URL", DEFAULT_REGISTRY))

  const theme =
    options.theme ??
    (nonInteractive ? DEFAULT_THEME : await promptTheme(registry))

  const config: Config = {
    $schema: "https://lorre-blocks.dev/schema.json",
    registry,
    tsx,
    theme,
    aliases: { ...DEFAULT_ALIASES },
  }

  await writeConfig(cwd, config)
  out.success("Wrote components.json")

  const pm = await detectPackageManager(cwd)
  const depSpinner = out.spinner()
  depSpinner.start(`Installing base dependencies with ${pm}`)
  try {
    await installDependencies(cwd, pm, BASE_DEPENDENCIES, { silent: out.isJsonMode() })
    depSpinner.stop(`Installed: ${BASE_DEPENDENCIES.join(", ")}`)
  } catch (err) {
    depSpinner.stop("Dependency install failed.")
    out.fail((err as Error).message)
  }

  const baseDir = await resolveBaseDir(cwd)
  const written: string[] = []

  try {
    const utils = await fetchRegistryItem(registry, "utils")
    for (const file of utils.files) {
      const dir = targetDirForType(file.type, config.aliases, baseDir)
      await fs.mkdir(dir, { recursive: true })
      const dest = path.join(dir, path.basename(file.path))
      await fs.writeFile(dest, rewriteImports(file.content, config), "utf8")
      written.push(path.relative(cwd, dest))
      out.success(`Wrote ${path.relative(cwd, dest)}`)
    }
  } catch (err) {
    out.warn(`Could not write utils: ${(err as Error).message}`)
  }

  let cssPath: string | null = null
  try {
    const themeCss = await fetchThemeCss(registry, theme)
    const resolved = await resolveGlobalCss(cwd)
    const existing = await readIfExists(resolved)
    const next = injectThemeBlock(existing ?? "", themeCss)
    await fs.mkdir(path.dirname(resolved), { recursive: true })
    await fs.writeFile(resolved, next, "utf8")
    cssPath = path.relative(cwd, resolved)
    out.success(
      `${existing === null ? "Created" : "Updated"} ${cssPath} with theme "${theme}"`
    )
  } catch (err) {
    out.warn(`Could not set up the theme: ${(err as Error).message}`)
  }

  if (out.isJsonMode()) {
    out.emit({
      config,
      written,
      cssPath,
      packageManager: pm,
      dependencies: BASE_DEPENDENCIES,
    })
    return
  }

  out.outro(
    `${color.green("✔")} Ready. Now run ${color.cyan("lorre-blocks add button")}.`
  )
}

async function promptTheme(registry: string): Promise<string> {
  let options: Array<{ value: string; label: string; hint?: string }>
  try {
    const themes = await fetchThemesIndex(registry)
    options = themes.map((t) => ({
      value: t.name,
      label: t.name,
      hint: t.description,
    }))
  } catch {
    // Registry predates named themes — only the default exists.
    return DEFAULT_THEME
  }
  if (options.length === 0) return DEFAULT_THEME

  const choice = await p.select({
    message: "Which theme do you want to start with?",
    options,
    initialValue: DEFAULT_THEME,
  })
  if (p.isCancel(choice)) {
    p.cancel("Init cancelled.")
    process.exit(0)
  }
  return choice as string
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
