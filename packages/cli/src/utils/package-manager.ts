import { promises as fs } from "node:fs"
import path from "node:path"
import { spawn } from "node:child_process"

export type PackageManager = "pnpm" | "yarn" | "bun" | "npm"

export async function detectPackageManager(cwd: string): Promise<PackageManager> {
  const has = async (f: string) =>
    fs
      .access(path.join(cwd, f))
      .then(() => true)
      .catch(() => false)

  if (await has("pnpm-lock.yaml")) return "pnpm"
  if (await has("yarn.lock")) return "yarn"
  if (await has("bun.lockb")) return "bun"
  return "npm"
}

function installArgs(pm: PackageManager, deps: string[]): string[] {
  switch (pm) {
    case "pnpm":
      return ["add", ...deps]
    case "yarn":
      return ["add", ...deps]
    case "bun":
      return ["add", ...deps]
    case "npm":
      return ["install", ...deps]
  }
}

export interface InstallOptions {
  /**
   * Capture the package manager's output instead of letting it reach our stdout.
   * Required in JSON mode: npm writes progress to stdout and would corrupt the
   * single JSON document the command emits.
   */
  silent?: boolean
}

export async function installDependencies(
  cwd: string,
  pm: PackageManager,
  deps: string[],
  options: InstallOptions = {}
): Promise<void> {
  if (deps.length === 0) return

  const useShell = process.platform === "win32"
  const args = installArgs(pm, deps).map((arg) =>
    // cmd.exe treats ^ as its escape character, which would mangle version
    // ranges like pkg@^1.2.3 — quoting each arg keeps them literal.
    useShell ? `"${arg}"` : arg
  )
  await new Promise<void>((resolve, reject) => {
    const child = spawn(pm, args, {
      cwd,
      stdio: options.silent ? ["ignore", "pipe", "pipe"] : "inherit",
      shell: useShell,
    })

    let captured = ""
    if (options.silent) {
      child.stdout?.on("data", (c) => (captured += c))
      child.stderr?.on("data", (c) => (captured += c))
    }

    child.on("error", reject)
    child.on("close", (code) => {
      if (code === 0) return resolve()
      const tail = captured.trim().split("\n").slice(-5).join("\n")
      reject(
        new Error(
          `${pm} ${args.join(" ")} exited with code ${code}${tail ? `\n${tail}` : ""}`
        )
      )
    })
  })
}
