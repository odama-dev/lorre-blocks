import { promises as fs } from "node:fs"
import path from "node:path"
import * as p from "@clack/prompts"
import color from "picocolors"

import { readConfig } from "../utils/config"
import { resolveTree } from "../utils/registry"
import {
  detectPackageManager,
  installDependencies,
} from "../utils/package-manager"
import {
  resolveBaseDir,
  rewriteImports,
  targetDirForType,
} from "../utils/paths"
import type { RegistryItem } from "../registry/schema"

export interface AddOptions {
  cwd: string
  components: string[]
  yes?: boolean
  overwrite?: boolean
}

export async function runAdd(options: AddOptions): Promise<void> {
  const { cwd, components } = options

  p.intro(color.bgCyan(color.black(" lorre-blocks add ")))

  const config = await readConfig(cwd)
  if (!config) {
    p.cancel(
      `No components.json found. Run ${color.cyan("lorre-blocks init")} first.`
    )
    process.exit(1)
  }

  if (components.length === 0) {
    p.cancel("Specify at least one component, e.g. `lorre-blocks add button`.")
    process.exit(1)
  }

  const spinner = p.spinner()
  spinner.start("Resolving components from the registry")
  let tree: RegistryItem[]
  try {
    tree = await resolveTree(config.registry, components)
  } catch (err) {
    spinner.stop("Failed to resolve components.")
    p.cancel((err as Error).message)
    process.exit(1)
  }
  spinner.stop(
    `Resolved ${tree.length} item(s): ${tree.map((t) => t.name).join(", ")}`
  )

  const npmDeps = [...new Set(tree.flatMap((t) => t.dependencies ?? []))]
  if (npmDeps.length > 0) {
    const pm = await detectPackageManager(cwd)
    const depSpinner = p.spinner()
    depSpinner.start(`Installing ${npmDeps.length} dependency(ies) with ${pm}`)
    try {
      await installDependencies(cwd, pm, npmDeps)
      depSpinner.stop(`Installed: ${npmDeps.join(", ")}`)
    } catch (err) {
      depSpinner.stop("Dependency install failed.")
      p.cancel((err as Error).message)
      process.exit(1)
    }
  }

  const baseDir = await resolveBaseDir(cwd)
  const written: string[] = []

  for (const item of tree) {
    for (const file of item.files) {
      const dir = targetDirForType(file.type, config.aliases, baseDir)
      const fileName = path.basename(file.path)
      const dest = path.join(dir, fileName)

      if (await fileExists(dest)) {
        const shouldOverwrite =
          options.overwrite ||
          options.yes ||
          (await p.confirm({
            message: `${path.relative(cwd, dest)} exists. Overwrite?`,
            initialValue: false,
          }))
        if (p.isCancel(shouldOverwrite) || !shouldOverwrite) {
          p.log.warn(`Skipped ${path.relative(cwd, dest)}`)
          continue
        }
      }

      await fs.mkdir(dir, { recursive: true })
      const content = rewriteImports(file.content, config)
      await fs.writeFile(dest, content, "utf8")
      written.push(path.relative(cwd, dest))
    }
  }

  if (written.length > 0) {
    p.log.success(`Added:\n${written.map((f) => `  ${color.green(f)}`).join("\n")}`)
  }
  p.outro(`${color.green("✔")} Done.`)
}

async function fileExists(f: string): Promise<boolean> {
  try {
    await fs.access(f)
    return true
  } catch {
    return false
  }
}
