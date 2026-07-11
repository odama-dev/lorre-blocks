import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"

import {
  classifyChange,
  emptyLock,
  readLock,
  recordInstall,
  sha256,
  toPosix,
  writeLock,
} from "./lock"
import type { RegistryItem } from "../registry/schema"

function item(name: string, checksum?: string): RegistryItem {
  return {
    name,
    type: "registry:ui",
    checksum,
    files: [{ path: `ui/${name}.tsx`, type: "registry:ui", content: "" }],
  }
}

const tmpDirs: string[] = []
async function tmpDir(): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "lorre-lock-"))
  tmpDirs.push(dir)
  return dir
}

afterEach(async () => {
  for (const dir of tmpDirs.splice(0)) {
    await fs.rm(dir, { recursive: true, force: true })
  }
})

describe("recordInstall", () => {
  it("hashes written files and keeps hashes for files skipped this run", () => {
    const lock = emptyLock("https://x.dev")
    recordInstall(lock, item("button", "c1"), [
      { rel: path.join("components", "ui", "button.tsx"), content: "v1" },
    ])
    expect(lock.items.button.checksum).toBe("c1")
    expect(lock.items.button.files["components/ui/button.tsx"]).toBe(sha256("v1"))

    // Re-install with a newer item but this file skipped: another file written,
    // the old hash must survive.
    recordInstall(lock, item("button", "c2"), [
      { rel: path.join("components", "ui", "extra.tsx"), content: "v2" },
    ])
    expect(lock.items.button.checksum).toBe("c2")
    expect(lock.items.button.files["components/ui/button.tsx"]).toBe(sha256("v1"))
    expect(lock.items.button.files["components/ui/extra.tsx"]).toBe(sha256("v2"))
  })
})

describe("read/write round-trip", () => {
  it("persists items and is byte-identical across rewrites (sorted keys)", async () => {
    const cwd = await tmpDir()
    const lock = emptyLock("https://x.dev")
    recordInstall(lock, item("b-item"), [{ rel: "b.tsx", content: "b" }])
    recordInstall(lock, item("a-item"), [{ rel: "z.tsx", content: "z" }])
    recordInstall(lock, item("a-item"), [{ rel: "a.tsx", content: "a" }])
    await writeLock(cwd, lock)
    const first = await fs.readFile(path.join(cwd, "lorre.lock"), "utf8")

    const reread = await readLock(cwd)
    expect(reread).not.toBeNull()
    expect(Object.keys(reread!.items)).toEqual(["a-item", "b-item"])
    expect(Object.keys(reread!.items["a-item"].files)).toEqual(["a.tsx", "z.tsx"])

    await writeLock(cwd, reread!)
    const second = await fs.readFile(path.join(cwd, "lorre.lock"), "utf8")
    expect(second).toBe(first)
  })

  it("returns null when the file is absent or not schema v1", async () => {
    const cwd = await tmpDir()
    expect(await readLock(cwd)).toBeNull()
    await fs.writeFile(path.join(cwd, "lorre.lock"), `{"schemaVersion":9}`, "utf8")
    expect(await readLock(cwd)).toBeNull()
  })
})

describe("classifyChange", () => {
  const installed = "installed content"
  const hash = sha256(installed)

  it("blames the registry when local still matches the lock", () => {
    expect(classifyChange(installed, "new registry content", hash)).toBe("upstream")
  })

  it("blames local edits when the registry still matches the lock", () => {
    expect(classifyChange("edited locally", installed, hash)).toBe("local")
  })

  it("reports both when neither side matches the lock", () => {
    expect(classifyChange("edited locally", "new registry content", hash)).toBe("both")
  })

  it("is unknown without a lock entry", () => {
    expect(classifyChange("a", "b", undefined)).toBe("unknown")
  })
})

describe("toPosix", () => {
  it("normalizes platform separators", () => {
    expect(toPosix(path.join("components", "ui", "button.tsx"))).toBe(
      "components/ui/button.tsx"
    )
  })
})
