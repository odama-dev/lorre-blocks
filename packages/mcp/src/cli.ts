import { execFile } from "node:child_process"
import { createRequire } from "node:module"
import path from "node:path"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

/**
 * The server is a thin adapter over the lorre-blocks CLI's --json contract:
 * one JSON document on stdout, {ok:false, error} + exit 1 on failure, never
 * prompts. Locate the CLI through normal module resolution so the workspace
 * copy is used in dev and the published dependency after install.
 */
export function resolveCliBin(): string {
  const require = createRequire(import.meta.url)
  const pkgPath = require.resolve("lorre-blocks/package.json")
  const pkg = require("lorre-blocks/package.json") as {
    bin: Record<string, string>
  }
  return path.join(path.dirname(pkgPath), pkg.bin["lorre-blocks"])
}

export interface CliResult {
  ok: boolean
  [key: string]: unknown
}

export async function runCli(args: string[]): Promise<CliResult> {
  const bin = resolveCliBin()
  let stdout: string
  try {
    const result = await execFileAsync(process.execPath, [bin, ...args, "--json"], {
      maxBuffer: 32 * 1024 * 1024,
      windowsHide: true,
    })
    stdout = result.stdout
  } catch (err) {
    // Non-zero exit still carries the {ok:false} document on stdout.
    const failed = err as { stdout?: string; message: string }
    if (!failed.stdout) {
      throw new Error(`lorre-blocks CLI failed to run: ${failed.message}`)
    }
    stdout = failed.stdout
  }
  try {
    return JSON.parse(stdout) as CliResult
  } catch {
    throw new Error(
      `lorre-blocks CLI emitted non-JSON output (first 200 chars): ${stdout.slice(0, 200)}`
    )
  }
}

// ---- pure arg builders (unit-tested) ----

export interface SearchArgs {
  query?: string
  category?: string
  source?: string
  type?: string
  limit?: number
  registry?: string
}

export function buildSearchArgs(input: SearchArgs): string[] {
  const args = ["search"]
  if (input.query) args.push(input.query)
  if (input.category) args.push("--category", input.category)
  if (input.source) args.push("--source", input.source)
  if (input.type) args.push("--type", input.type)
  if (input.limit !== undefined) args.push("--limit", String(input.limit))
  if (input.registry) args.push("--registry", input.registry)
  return args
}

export function buildInfoArgs(name: string, registry?: string): string[] {
  const args = ["info", name, "--files"]
  if (registry) args.push("--registry", registry)
  return args
}

export function buildAddArgs(
  names: string[],
  projectDir: string,
  overwrite?: boolean
): string[] {
  const args = ["add", ...names, "--cwd", projectDir]
  if (overwrite) args.push("--overwrite")
  return args
}

export function buildThemeApplyArgs(
  theme: string | undefined,
  projectDir: string
): string[] {
  // No name = re-apply the project's lorre.theme.json (custom theme loop).
  return theme
    ? ["theme", "apply", theme, "--cwd", projectDir]
    : ["theme", "apply", "--cwd", projectDir]
}

export function buildThemeCreateArgs(
  fromFile: string,
  projectDir: string,
  install?: boolean
): string[] {
  const args = ["theme", "create", "--from", fromFile, "--cwd", projectDir]
  if (install === false) args.push("--no-install")
  return args
}

export function buildThemeShowArgs(projectDir: string): string[] {
  return ["theme", "show", "--cwd", projectDir]
}

export const DEFAULT_REGISTRY = "https://lorre-blocks.vercel.app"

export function buildThemeListArgs(registry?: string): string[] {
  // `theme list` is the one command with no built-in registry fallback — it
  // normally reads components.json, which the MCP server's cwd doesn't have.
  return ["theme", "list", "--registry", registry ?? DEFAULT_REGISTRY]
}
