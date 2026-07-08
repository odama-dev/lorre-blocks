import { promises as fs } from "node:fs"
import path from "node:path"

import type { Aliases, Config } from "./config"
import type { RegistryItemType } from "../registry/schema"

export async function resolveBaseDir(cwd: string): Promise<string> {
  for (const file of ["tsconfig.json", "jsconfig.json"]) {
    try {
      const raw = await fs.readFile(path.join(cwd, file), "utf8")
      const json = JSON.parse(stripJsonComments(raw))
      const paths: Record<string, string[]> | undefined =
        json?.compilerOptions?.paths
      const baseUrl: string = json?.compilerOptions?.baseUrl ?? "."
      const target = paths?.["@/*"]?.[0]
      if (target) {
        const dir = target.replace(/\/\*$/, "")
        return path.resolve(cwd, baseUrl, dir)
      }
    } catch {
      continue
    }
  }

  try {
    const srcStat = await fs.stat(path.join(cwd, "src"))
    if (srcStat.isDirectory()) return path.join(cwd, "src")
  } catch {
    // fall through
  }
  return cwd
}

export function aliasToDir(alias: string, baseDir: string): string {
  const rel = alias.replace(/^@\//, "")
  return path.join(baseDir, rel)
}

export function targetDirForType(
  type: RegistryItemType,
  aliases: Aliases,
  baseDir: string
): string {
  switch (type) {
    case "registry:ui":
      return aliasToDir(aliases.ui, baseDir)
    case "registry:hook":
      return aliasToDir(aliases.hooks, baseDir)
    case "registry:lib":
      return aliasToDir(aliases.lib, baseDir)
  }
}

export function rewriteImports(content: string, config: Config): string {
  const { aliases } = config
  const replacements: Array<[string, string]> = [
    ["@/lib/utils", aliases.utils],
    ["@/components/ui", aliases.ui],
    ["@/components", aliases.components],
    ["@/hooks", aliases.hooks],
    ["@/lib", aliases.lib],
  ]

  let result = content
  for (const [from, to] of replacements) {
    if (from === to) continue
    const pattern = new RegExp(`(["'\`])${escapeRegExp(from)}(?=["'\`/])`, "g")
    result = result.replace(pattern, `$1${to}`)
  }
  return result
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function stripJsonComments(input: string): string {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1")
    .replace(/,(\s*[}\]])/g, "$1")
}
