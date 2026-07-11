import { promises as fs } from "node:fs"
import path from "node:path"
import color from "picocolors"

import { DEFAULT_ALIASES, DEFAULT_REGISTRY, readConfig } from "../utils/config"
import { resolveBaseDir, targetDirForType } from "../utils/paths"
import { validatePlanShape, resolvePlan, type Plan } from "../utils/plan"
import * as out from "../utils/output"

export interface PlanCheckOptions {
  cwd: string
  file: string
  registry?: string
}

/** Read + parse a plan file; BOM-tolerant (Windows editors love BOMs). */
export async function readPlanFile(
  cwd: string,
  file: string
): Promise<{ plan: Plan | null; problems: string[] }> {
  const full = path.resolve(cwd, file)
  let raw: string
  try {
    raw = await fs.readFile(full, "utf8")
  } catch {
    return { plan: null, problems: [`could not read plan file ${full}`] }
  }
  let data: unknown
  try {
    data = JSON.parse(raw.replace(/^﻿/, ""))
  } catch (err) {
    return { plan: null, problems: [`plan file is not valid JSON: ${(err as Error).message}`] }
  }
  const problems = validatePlanShape(data)
  return { plan: problems.length === 0 ? (data as Plan) : null, problems }
}

export async function runPlanCheck(options: PlanCheckOptions): Promise<void> {
  const { cwd, file } = options

  out.intro(color.bgCyan(color.black(" lorre-blocks plan check ")))

  const config = await readConfig(cwd)
  const registry = options.registry ?? config?.registry ?? DEFAULT_REGISTRY
  const aliases = config?.aliases ?? DEFAULT_ALIASES

  const { plan, problems } = await readPlanFile(cwd, file)
  if (!plan) {
    out.fail(`Plan is invalid (${problems.length} problem(s)).`, { problems })
  }

  const spinner = out.spinner()
  spinner.start("Resolving plan against the registry")
  const { resolution, problems: registryProblems } = await resolvePlan(registry, plan)
  if (!resolution) {
    spinner.stop("Plan does not resolve.")
    out.fail(`Plan does not resolve (${registryProblems.length} problem(s)).`, {
      problems: registryProblems,
    })
  }
  spinner.stop(`Resolved ${resolution.installOrder.length} item(s).`)

  const baseDir = await resolveBaseDir(cwd)
  const files = resolution.items.flatMap((item) =>
    item.files.map((f) => ({
      item: item.name,
      path: f.path,
      type: f.type,
      target: path.relative(
        cwd,
        path.join(targetDirForType(f.type, aliases, baseDir), path.basename(f.path))
      ),
    }))
  )

  if (out.isJsonMode()) {
    out.emit({
      plan,
      resolution: {
        theme: resolution.theme,
        installOrder: resolution.installOrder,
        npmDependencies: resolution.npmDependencies,
        files,
      },
      problems: [],
    })
    return
  }

  out.success(`Theme: ${resolution.theme}`)
  out.success(`Install order: ${resolution.installOrder.join(" → ")}`)
  if (resolution.npmDependencies.length > 0) {
    out.message(`npm: ${resolution.npmDependencies.join(", ")}`)
  }
  if (plan.gaps?.length) {
    for (const gap of plan.gaps) {
      out.warn(`gap: ${gap.need}${gap.decision ? ` (${gap.decision})` : ""}`)
    }
  }
  out.outro(`${color.green("✔")} Plan is valid. Run ${color.cyan(`lorre-blocks apply ${file}`)}.`)
}
