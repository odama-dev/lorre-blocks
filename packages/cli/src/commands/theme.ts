import { promises as fs } from "node:fs"
import path from "node:path"
import color from "picocolors"

import {
  getIconSet,
  getResolvedTheme,
  isExplicitTypeScale,
  isRamp,
  resolveTheme,
  themeDefinitions,
  type ResolvedTheme,
  type ThemeDefinition,
} from "@lorre-blocks/tokens"

import { readConfig, writeConfig, ROOT_THEME } from "../utils/config"
import { injectThemeBlock } from "../utils/css"
import { readIfExists, resolveGlobalCss } from "../utils/global-css"
import {
  detectPackageManager,
  installDependencies,
} from "../utils/package-manager"
import { fetchThemeCss, fetchThemesIndex } from "../utils/registry"
import {
  applyFlags,
  definitionToCss,
  iconPackageFor,
  readThemeFile,
  THEME_FILE,
  validateDefinition,
  writeThemeFile,
  type ThemeCreateFlags,
} from "../utils/theme-def"
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
  /** Registry theme name; omit to re-apply the local lorre.theme.json. */
  name?: string
}

export async function runThemeApply(options: ThemeApplyOptions): Promise<void> {
  const { cwd, name } = options

  out.intro(color.bgCyan(color.black(" lorre-blocks theme ")))

  const config = await readConfig(cwd)
  if (!config) {
    out.fail("No components.json found. Run `lorre-blocks init` first.")
  }

  // No name: regenerate from the local custom-theme file (edit → re-apply loop).
  if (!name) {
    const data = await readThemeFile(cwd)
    if (data === null) {
      out.fail(
        `No theme name given and no ${THEME_FILE} found. Pass a name (e.g. dreamy) or run \`theme create\` first.`
      )
    }
    const { def, problems } = validateDefinition(data)
    if (!def) {
      out.fail(`${THEME_FILE} is invalid (${problems.length} problem(s)).`, { problems })
    }
    const relCss = await injectCss(cwd, definitionToCss(def))
    await writeConfig(cwd, { ...config, theme: def.name })
    out.success(`Re-applied "${def.name}" from ${THEME_FILE} to ${relCss.rel}`)
    if (out.isJsonMode()) {
      out.emit({ theme: def.name, source: THEME_FILE, cssPath: relCss.rel, created: relCss.created })
      return
    }
    out.outro(`${color.green("✔")} Theme applied. Components pick it up automatically.`)
    return
  }

  let css: string
  try {
    css = await fetchThemeCss(config.registry, name)
  } catch (err) {
    out.fail((err as Error).message)
  }

  const { rel: relCss, created } = await injectCss(cwd, css)
  out.success(`${created ? "Created" : "Updated"} ${relCss} with theme "${name}"`)

  await writeConfig(cwd, { ...config, theme: name })
  out.success(`Set "theme": "${name}" in components.json`)

  if (out.isJsonMode()) {
    out.emit({ theme: name, cssPath: relCss, created })
    return
  }

  out.outro(`${color.green("✔")} Theme applied. Components pick it up automatically.`)
}

async function injectCss(
  cwd: string,
  css: string
): Promise<{ rel: string; created: boolean }> {
  const cssPath = await resolveGlobalCss(cwd)
  const existing = await readIfExists(cssPath)
  const next = injectThemeBlock(existing ?? "", css)
  await fs.mkdir(path.dirname(cssPath), { recursive: true })
  await fs.writeFile(cssPath, next, "utf8")
  return { rel: path.relative(cwd, cssPath), created: existing === null }
}

export interface ThemeCreateOptions extends ThemeCreateFlags {
  cwd: string
  from?: string
  /**
   * Acknowledge that the chosen icon set is private. Without it a private set
   * is refused — the flag exists so nobody wires a Lorre-only package into a
   * project by accident and then can't install it in CI.
   */
  allowPrivate?: boolean
  /** Skip installing the icon-set npm package. */
  install?: boolean
}

/**
 * Create (or update) a custom theme: flags and/or a definition file in, CSS
 * injected into the global stylesheet + lorre.theme.json out. Fully offline —
 * the token engine is bundled, so agents get Studio-identical output locally.
 */
export async function runThemeCreate(options: ThemeCreateOptions): Promise<void> {
  const { cwd } = options

  out.intro(color.bgCyan(color.black(" lorre-blocks theme create ")))

  const config = await readConfig(cwd)
  if (!config) {
    out.fail("No components.json found. Run `lorre-blocks init` first.")
  }

  let base: Record<string, unknown> = {}
  if (options.from) {
    const raw = await readIfExists(path.resolve(cwd, options.from))
    if (raw === null) {
      out.fail(`Cannot read ${options.from}`)
    }
    try {
      base = JSON.parse(raw) as Record<string, unknown>
    } catch (err) {
      out.fail(`${options.from} is not valid JSON: ${(err as Error).message}`)
    }
  }

  let merged: Record<string, unknown>
  try {
    merged = applyFlags(base, options)
  } catch (err) {
    out.fail((err as Error).message)
  }

  const { def, problems } = validateDefinition(merged)
  if (!def) {
    out.fail(`Theme definition is invalid (${problems.length} problem(s)).`, { problems })
  }

  // Refuse before anything is written — a half-applied theme plus an error is
  // worse than no theme at all.
  const privateSet = def.icons ? getIconSet(def.icons.set) : undefined
  if (privateSet?.private && !options.allowPrivate) {
    out.fail(
      `Icon set "${privateSet.name}" is private (Lorre-only). Pass --private to ` +
        `confirm, and make sure npm is authenticated against ${privateSet.registry}.`
    )
  }

  let css: string
  try {
    css = definitionToCss(def)
  } catch (err) {
    out.fail((err as Error).message)
  }

  const { rel: relCss, created } = await injectCss(cwd, css)
  out.success(`${created ? "Created" : "Updated"} ${relCss} with theme "${def.name}"`)

  await writeThemeFile(cwd, def)
  out.success(`Wrote ${THEME_FILE} (edit it and re-run \`theme apply\` to iterate)`)

  await writeConfig(cwd, { ...config, theme: def.name })
  out.success(`Set "theme": "${def.name}" in components.json`)

  // The registry line is configuration, not installation — write it even under
  // --no-install, or the manual `npm i` that follows resolves against public npm.
  if (privateSet?.private && privateSet.registry && privateSet.package) {
    await ensureScopedRegistry(cwd, privateSet.package, privateSet.registry)
  }

  let iconPackage: string | null = null
  if (options.install !== false) {
    iconPackage = iconPackageFor(def)
    if (iconPackage && !(await hasDependency(cwd, iconPackage))) {
      const pm = await detectPackageManager(cwd)
      const spinner = out.spinner()
      spinner.start(`Installing icon set ${iconPackage} with ${pm}`)
      try {
        await installDependencies(cwd, pm, [iconPackage], { silent: out.isJsonMode() })
        spinner.stop(`Installed ${iconPackage}.`)
      } catch (err) {
        spinner.stop("Icon set install failed.")
        out.warn(`Could not install ${iconPackage}: ${(err as Error).message}`)
        iconPackage = null
      }
    } else if (iconPackage) {
      iconPackage = null // already present, nothing installed
    }
  }

  if (out.isJsonMode()) {
    out.emit({
      theme: def.name,
      themeFile: THEME_FILE,
      cssPath: relCss,
      created,
      icons: def.icons ?? null,
      iconPackageInstalled: iconPackage,
    })
    return
  }

  out.outro(`${color.green("✔")} Theme "${def.name}" created and applied.`)
}

export interface ThemeShowOptions {
  cwd: string
}

/**
 * Print the resolved token set of the active theme so an agent can inspect
 * the design system (scales, semantics, type scale, component tokens)
 * without parsing CSS.
 */
export async function runThemeShow(options: ThemeShowOptions): Promise<void> {
  const { cwd } = options

  const config = await readConfig(cwd)
  if (!config) {
    out.fail("No components.json found. Run `lorre-blocks init` first.")
  }

  let resolved: ResolvedTheme
  let source: string
  const data = await readThemeFile(cwd)
  if (data !== null) {
    const { def, problems } = validateDefinition(data)
    if (!def) {
      out.fail(`${THEME_FILE} is invalid (${problems.length} problem(s)).`, { problems })
    }
    resolved = resolveTheme(def as ThemeDefinition)
    source = THEME_FILE
  } else {
    const name = config.theme ?? ROOT_THEME
    try {
      resolved = getResolvedTheme(name)
    } catch {
      out.fail(
        `Theme "${name}" is not a built-in theme and no ${THEME_FILE} exists. Built-ins: ${themeDefinitions.map((t) => t.name).join(", ")}`
      )
    }
    source = "built-in"
  }

  if (out.isJsonMode()) {
    out.emit({ source, resolved })
    return
  }

  console.log(`${color.bold(resolved.name)} ${color.dim(`(${source})`)}`)
  console.log(color.dim(resolved.description))
  for (const [scale, spec] of Object.entries(resolved.colors)) {
    if (!spec) continue
    // A pinned scale has no seed to report, so show its solid step instead.
    const detail = isRamp(spec)
      ? `pinned  solid ${spec.steps[8]}  dark ${spec.dark.steps[8]}`
      : `hue ${spec.hue}  chroma ${spec.chroma}  lightness ${spec.lightness}`
    console.log(`  ${scale.padEnd(10)} ${detail}`)
  }
  console.log(`  ${"radius".padEnd(10)} base ${resolved.radius.base}`)
  console.log(`  ${"font-sans".padEnd(10)} ${resolved.typography.fontSans[0]}`)
  if (resolved.typography.typeScale) {
    const ts = resolved.typography.typeScale
    const detail = isExplicitTypeScale(ts)
      ? `${Object.keys(ts.steps).length} measured steps`
      : `base ${ts.base}  ratio ${ts.ratio}`
    console.log(`  ${"type".padEnd(10)} ${detail}`)
  }
  if (resolved.spacing) {
    console.log(`  ${"spacing".padEnd(10)} scaling ${resolved.spacing.scaling}`)
  }
  if (resolved.icons) {
    console.log(
      `  ${"icons".padEnd(10)} ${resolved.icons.set}${resolved.icons.style ? ` (${resolved.icons.style})` : ""}`
    )
  }
}

/**
 * Point the package's scope at its private registry via the project .npmrc,
 * so `install` resolves it instead of 404-ing against public npm.
 *
 * Only the registry line is written — never a token. Credentials belong in the
 * user's ~/.npmrc or CI secrets; writing one into the project would be the
 * exact leak this whole mechanism exists to prevent.
 */
async function ensureScopedRegistry(
  cwd: string,
  pkg: string,
  registry: string
): Promise<void> {
  const scope = pkg.startsWith("@") ? pkg.split("/")[0] : null
  if (!scope) return

  const npmrc = path.join(cwd, ".npmrc")
  const line = `${scope}:registry=${registry}`
  const existing = (await readIfExists(npmrc)) ?? ""
  if (existing.split(/\r?\n/).some((l) => l.trim() === line)) return

  const body = existing && !existing.endsWith("\n") ? existing + "\n" : existing
  await fs.writeFile(npmrc, `${body}${line}\n`, "utf8")
  out.success(`Pointed ${scope} at ${registry} in .npmrc`)
  out.warn(
    `${pkg} is private — authenticate first (e.g. \`npm login --scope=${scope} ` +
      `--registry=${registry}\`) or installing it fails with 401/404.`
  )
}

async function hasDependency(cwd: string, name: string): Promise<boolean> {
  try {
    const raw = await fs.readFile(path.join(cwd, "package.json"), "utf8")
    const pkg = JSON.parse(raw) as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }
    return Boolean(pkg.dependencies?.[name] ?? pkg.devDependencies?.[name])
  } catch {
    return false
  }
}
