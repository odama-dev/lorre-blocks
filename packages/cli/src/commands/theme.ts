import { promises as fs } from "node:fs"
import path from "node:path"
import * as p from "@clack/prompts"
import color from "picocolors"

import { readConfig, writeConfig } from "../utils/config"
import { injectThemeBlock } from "../utils/css"
import { readIfExists, resolveGlobalCss } from "../utils/global-css"
import { fetchThemeCss, fetchThemesIndex } from "../utils/registry"

export interface ThemeListOptions {
  cwd: string
  registry?: string
}

export async function runThemeList(options: ThemeListOptions): Promise<void> {
  const config = await readConfig(options.cwd)
  const registry = options.registry ?? config?.registry
  if (!registry) {
    console.error(
      "No registry configured. Run `lorre-blocks init` first or pass --registry."
    )
    process.exit(1)
  }

  const themes = await fetchThemesIndex(registry)
  for (const theme of themes) {
    const active = config?.theme === theme.name ? color.green(" (active)") : ""
    const base = theme.extends ? color.dim(` extends ${theme.extends}`) : ""
    console.log(`${color.bold(theme.name)}${active}${base}`)
    if (theme.description) console.log(`  ${color.dim(theme.description)}`)
  }
}

export interface ThemeApplyOptions {
  cwd: string
  name: string
}

export async function runThemeApply(options: ThemeApplyOptions): Promise<void> {
  const { cwd, name } = options

  p.intro(color.bgCyan(color.black(" lorre-blocks theme ")))

  const config = await readConfig(cwd)
  if (!config) {
    p.cancel("No components.json found. Run `lorre-blocks init` first.")
    process.exit(1)
  }

  let css: string
  try {
    css = await fetchThemeCss(config.registry, name)
  } catch (err) {
    p.cancel((err as Error).message)
    process.exit(1)
  }

  const cssPath = await resolveGlobalCss(cwd)
  const existing = await readIfExists(cssPath)
  const next = injectThemeBlock(existing ?? "", css)
  await fs.mkdir(path.dirname(cssPath), { recursive: true })
  await fs.writeFile(cssPath, next, "utf8")
  p.log.success(
    `${existing === null ? "Created" : "Updated"} ${path.relative(cwd, cssPath)} with theme "${name}"`
  )

  await writeConfig(cwd, { ...config, theme: name })
  p.log.success(`Set "theme": "${name}" in components.json`)

  p.outro(`${color.green("✔")} Theme applied. Components pick it up automatically.`)
}
