import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { detectPackageManager } from "./package-manager"

describe("detectPackageManager", () => {
  let dir: string
  beforeAll(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "lb-pm-"))
  })
  afterAll(async () => {
    await fs.rm(dir, { recursive: true, force: true })
  })

  async function withLockfile(name: string | null): Promise<string> {
    const proj = path.join(dir, name ?? "none")
    await fs.mkdir(proj, { recursive: true })
    if (name) await fs.writeFile(path.join(proj, name), "")
    return proj
  }

  it("detects pnpm", async () => {
    expect(await detectPackageManager(await withLockfile("pnpm-lock.yaml"))).toBe("pnpm")
  })

  it("detects yarn", async () => {
    expect(await detectPackageManager(await withLockfile("yarn.lock"))).toBe("yarn")
  })

  it("detects bun", async () => {
    expect(await detectPackageManager(await withLockfile("bun.lockb"))).toBe("bun")
  })

  it("defaults to npm when no lockfile is present", async () => {
    expect(await detectPackageManager(await withLockfile(null))).toBe("npm")
  })
})
