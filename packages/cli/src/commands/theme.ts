import { promises as fs } from "node:fs"
import path from "node:path"
import color from "picocolors"

import { readConfig, writeConfig } from "../utils/config"
import { injectThemeBlock } from "../utils/css"
import { readIfExists, resolveGlobalCss } from "../utils/global-css"
import { fetchThemeCss, fetchThemesIndex } from "../utils/registry"
import * as out from "../utils/output"

export interface ThemeListOptions {
  cwd: string
  registry?: string
}

export async function runThemeList(options: ThemeListOptions): Promise<void> {
  const config = await readConfig(options.cwd)
  const registry = options.registry ?? config?.registry
  if (!registry) {
    out.fail("No registry configured. Run `lorre-blocks init` first or pass --registry.")
  }

  let themes
  try {
    themes = await fetchThemesIndex(registry)
  } catch (err) {
    out.fail((err as Error).message)
  }

  if (out.isJsonMode()) {
    out.emit({
      registry,
      active: config?.theme ?? null,
      count: themes.length,
      themes: themes.map((t) => ({
        ...t,
        active: config?.theme === t.name,
      })),
    })
    return
  }

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

  out.intro(color.bgCyan(color.black(" lorre-blocks theme ")))

  const config = await readConfig(cwd)
  if (!config) {
    out.fail("No components.json found. Run `lorre-blocks init` first.")
  }

  let css: string
  try {
    css = await fetchThemeCss(config.registry, name)
  } catch (err) {
    out.fail((err as Error).message)
  }

  const cssPath = await resolveGlobalCss(cwd)
  const existing = await readIfExists(cssPath)
  const next = injectThemeBlock(existing ?? "", css)
  await fs.mkdir(path.dirname(cssPath), { recursive: true })
  await fs.writeFile(cssPath, next, "utf8")
  const relCss = path.relative(cwd, cssPath)
  out.success(`${existing === null ? "Created" : "Updated"} ${relCss} with theme "${name}"`)

  await writeConfig(cwd, { ...config, theme: name })
  out.success(`Set "theme": "${name}" in components.json`)

  if (out.isJsonMode()) {
    out.emit({ theme: name, cssPath: relCss, created: existing === null })
    return
  }

  out.outro(`${color.green("✔")} Theme applied. Components pick it up automatically.`)
}
