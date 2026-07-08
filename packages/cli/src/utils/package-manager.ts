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

export async function installDependencies(
  cwd: string,
  pm: PackageManager,
  deps: string[]
): Promise<void> {
  if (deps.length === 0) return

  const args = installArgs(pm, deps)
  await new Promise<void>((resolve, reject) => {
    const child = spawn(pm, args, {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32",
    })
    child.on("error", reject)
    child.on("close", (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${pm} ${args.join(" ")} exited with code ${code}`))
    })
  })
}
