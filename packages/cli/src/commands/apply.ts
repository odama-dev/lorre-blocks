import { promises as fs } from "node:fs"
import path from "node:path"
import color from "picocolors"

import {
  Config,
  DEFAULT_ALIASES,
  DEFAULT_REGISTRY,
  readConfig,
  writeConfig,
} from "../utils/config"
import {
  detectPackageManager,
  installDependencies,
} from "../utils/package-manager"
import { resolveBaseDir, rewriteImports, targetDirForType } from "../utils/paths"
import { fetchThemeCss } from "../utils/registry"
import { injectThemeBlock } from "../utils/css"
import { readIfExists, resolveGlobalCss } from "../utils/global-css"
import {
  injectOverridesBlock,
  overridesToCss,
  resolvePlan,
  stripOverridesBlock,
} from "../utils/plan"
import { readPlanFile } from "./plan"
import { LOCK_FILE, emptyLock, readLock, recordInstall, writeLock } from "../utils/lock"
import * as out from "../utils/output"

export interface ApplyOptions {
  cwd: string
  file: string
  registry?: string
  overwrite?: boolean
}

// Kept in sync with init's BASE_DEPENDENCIES (ranges track packages/registry).
const BASE_DEPENDENCIES = [
  "clsx@^2.1.1",
  "tailwind-merge@^3.6.0",
  "class-variance-authority@^0.7.1",
  "tw-animate-css@^1.4.0",
]

/**
 * Execute a plan: init semantics (config + theme + base deps) plus add
 * semantics (items + npm deps) in one run, then record lorre.plan.json.
 * Re-runs the full check first and refuses to touch the filesystem on problems.
 */
export async function runApply(options: ApplyOptions): Promise<void> {
  const { cwd, file } = options

  out.intro(color.bgCyan(color.black(" lorre-blocks apply ")))

  const existingConfig = await readConfig(cwd)
  const registry = options.registry ?? existingConfig?.registry ?? DEFAULT_REGISTRY

  const { plan, problems } = await readPlanFile(cwd, file)
  if (!plan) {
    out.fail(`Plan is invalid (${problems.length} problem(s)).`, { problems })
  }

  const spinner = out.spinner()
  spinner.start("Checking plan against the registry")
  const { resolution, problems: registryProblems } = await resolvePlan(registry, plan)
  if (!resolution) {
    spinner.stop("Plan does not resolve.")
    out.fail(`Plan does not resolve (${registryProblems.length} problem(s)).`, {
      problems: registryProblems,
    })
  }
  spinner.stop(`Plan ok: ${resolution.installOrder.length} item(s), theme "${resolution.theme}".`)

  // --- config (init semantics; keep existing aliases/registry when present)
  const config: Config = {
    $schema: existingConfig?.$schema ?? "https://lorre-blocks.dev/schema.json",
    registry,
    tsx: existingConfig?.tsx ?? (await fileExists(path.join(cwd, "tsconfig.json"))),
    theme: plan.theme.name,
    aliases: existingConfig?.aliases ?? { ...DEFAULT_ALIASES },
  }
  await writeConfig(cwd, config)
  out.success("Wrote components.json")

  // --- one package-manager pass for base + item deps
  const npmDeps = [...new Set([...BASE_DEPENDENCIES, ...resolution.npmDependencies])]
  const pm = await detectPackageManager(cwd)
  const depSpinner = out.spinner()
  depSpinner.start(`Installing ${npmDeps.length} dependency(ies) with ${pm}`)
  try {
    await installDependencies(cwd, pm, npmDeps, { silent: out.isJsonMode() })
    depSpinner.stop(`Installed ${npmDeps.length} dependency(ies).`)
  } catch (err) {
    depSpinner.stop("Dependency install failed.")
    out.fail((err as Error).message)
  }

  // --- theme + overrides in the global stylesheet
  let cssPath: string | null = null
  try {
    const themeCss = await fetchThemeCss(registry, plan.theme.name)
    const resolved = await resolveGlobalCss(cwd)
    const existing = await readIfExists(resolved)
    let next = injectThemeBlock(existing ?? "", themeCss)
    next =
      plan.tokenOverrides && Object.keys(plan.tokenOverrides).length > 0
        ? injectOverridesBlock(next, overridesToCss(plan.tokenOverrides))
        : stripOverridesBlock(next)
    await fs.mkdir(path.dirname(resolved), { recursive: true })
    await fs.writeFile(resolved, next, "utf8")
    cssPath = path.relative(cwd, resolved)
    out.success(`Applied theme "${plan.theme.name}" to ${cssPath}`)
  } catch (err) {
    out.warn(`Could not set up the theme: ${(err as Error).message}`)
  }

  // --- write files (add semantics: skip existing unless --overwrite)
  const baseDir = await resolveBaseDir(cwd)
  const written: string[] = []
  const skipped: string[] = []
  const lock = (await readLock(cwd)) ?? emptyLock(registry)
  lock.registry = registry
  let lockDirty = false
  for (const item of resolution.items) {
    const writtenForItem: Array<{ rel: string; content: string }> = []
    for (const f of item.files) {
      const dir = targetDirForType(f.type, config.aliases, baseDir)
      const dest = path.join(dir, path.basename(f.path))
      const rel = path.relative(cwd, dest)
      if (!options.overwrite && (await fileExists(dest))) {
        out.warn(`Skipped ${rel} (already exists; pass --overwrite to replace)`)
        skipped.push(rel)
        continue
      }
      const content = rewriteImports(f.content, config)
      await fs.mkdir(dir, { recursive: true })
      await fs.writeFile(dest, content, "utf8")
      written.push(rel)
      writtenForItem.push({ rel, content })
    }
    if (writtenForItem.length > 0) {
      recordInstall(lock, item, writtenForItem)
      lockDirty = true
    }
  }
  if (lockDirty) {
    await writeLock(cwd, lock)
    out.success(`Recorded ${LOCK_FILE}`)
  }

  // --- record the applied plan (agent-readable receipt; lorre.lock holds the hashes)
  const record = {
    plan,
    resolved: {
      registry,
      installOrder: resolution.installOrder,
      npmDependencies: resolution.npmDependencies,
    },
  }
  const recordPath = path.join(cwd, "lorre.plan.json")
  await fs.writeFile(recordPath, JSON.stringify(record, null, 2) + "\n", "utf8")
  out.success("Recorded lorre.plan.json")

  if (out.isJsonMode()) {
    out.emit({
      config,
      resolved: resolution.installOrder,
      written,
      skipped,
      cssPath,
      overrides: plan.tokenOverrides ?? null,
      gaps: plan.gaps ?? [],
      npmDependencies: npmDeps,
      packageManager: pm,
      planRecord: "lorre.plan.json",
      lock: lockDirty ? LOCK_FILE : null,
    })
    return
  }

  if (plan.gaps?.length) {
    for (const gap of plan.gaps) {
      out.warn(`gap to resolve later: ${gap.need}${gap.decision ? ` (${gap.decision})` : ""}`)
    }
  }
  out.outro(`${color.green("✔")} Applied plan "${plan.name}".`)
}

async function fileExists(f: string): Promise<boolean> {
  try {
    await fs.access(f)
    return true
  } catch {
    return false
  }
}
