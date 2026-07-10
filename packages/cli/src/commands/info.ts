import path from "node:path"
import color from "picocolors"

import { DEFAULT_ALIASES, DEFAULT_REGISTRY, readConfig } from "../utils/config"
import { fetchRegistryItem, resolveTree } from "../utils/registry"
import { resolveBaseDir, targetDirForType } from "../utils/paths"
import * as out from "../utils/output"

export interface InfoOptions {
  cwd: string
  name: string
  registry?: string
  /** Include full file contents in the JSON payload. */
  files?: boolean
}

export async function runInfo(options: InfoOptions): Promise<void> {
  const { cwd, name } = options
  const config = await readConfig(cwd)
  const registry = options.registry ?? config?.registry ?? DEFAULT_REGISTRY
  const aliases = config?.aliases ?? DEFAULT_ALIASES

  let item
  try {
    item = await fetchRegistryItem(registry, name)
  } catch (err) {
    out.fail((err as Error).message)
  }

  // Where each file would land in this project, so an agent can predict the write.
  const baseDir = await resolveBaseDir(cwd)
  const files = item.files.map((f) => ({
    path: f.path,
    type: f.type,
    target: path.relative(
      cwd,
      path.join(targetDirForType(f.type, aliases, baseDir), path.basename(f.path))
    ),
    ...(options.files ? { content: f.content } : {}),
  }))

  // Full install closure: registry deps resolved transitively, npm deps unioned.
  const tree = await resolveTree(registry, [name]).catch(() => [item])
  const npmDependencies = [...new Set(tree.flatMap((t) => t.dependencies ?? []))]

  if (out.isJsonMode()) {
    out.emit({
      name: item.name,
      type: item.type,
      description: item.description,
      source: item.source,
      category: item.category,
      tokenType: item.tokenType,
      themes: item.themes,
      tags: item.tags,
      license: item.license,
      checksum: item.checksum,
      dependencies: item.dependencies ?? [],
      registryDependencies: item.registryDependencies ?? [],
      installOrder: tree.map((t) => t.name),
      npmDependencies,
      files,
    })
    return
  }

  out.intro(color.bgCyan(color.black(` lorre-blocks info: ${item.name} `)))

  const rows: Array<[string, string | undefined]> = [
    ["type", item.type],
    ["category", item.category],
    ["source", item.source],
    ["license", item.license],
    ["themes", item.themes?.join(", ") ?? "theme-agnostic"],
    ["tags", item.tags?.join(", ")],
    ["npm deps", npmDependencies.join(", ") || "none"],
    ["registry deps", item.registryDependencies?.join(", ") || "none"],
    ["install order", tree.map((t) => t.name).join(" → ")],
  ]
  const width = Math.max(...rows.map(([k]) => k.length))
  const meta = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `  ${color.dim(k.padEnd(width))}  ${v}`)
    .join("\n")

  const fileLines = files
    .map((f) => `  ${color.green(f.path)} ${color.dim("→")} ${f.target}`)
    .join("\n")

  out.message(
    `${item.description ?? ""}\n\n${meta}\n\n${color.bold("files")}\n${fileLines}`
  )
  out.outro(`Add it with ${color.cyan(`lorre-blocks add ${item.name}`)}.`)
}
