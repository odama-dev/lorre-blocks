import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { aliasToDir, resolveBaseDir, rewriteImports, targetDirForType } from "./paths"
import { DEFAULT_ALIASES, type Config } from "./config"

const baseConfig: Config = {
  registry: "https://example.com",
  tsx: true,
  aliases: { ...DEFAULT_ALIASES },
}

describe("rewriteImports", () => {
  it("is a no-op with default aliases", () => {
    const src = `import { cn } from "@/lib/utils"\n`
    expect(rewriteImports(src, baseConfig)).toBe(src)
  })

  it("rewrites @/lib/utils to a custom utils alias", () => {
    const src = `import { cn } from "@/lib/utils"\n`
    const config: Config = {
      ...baseConfig,
      aliases: { ...DEFAULT_ALIASES, utils: "@/utils" },
    }
    expect(rewriteImports(src, config)).toContain(`from "@/utils"`)
  })

  it("prefers the longest matching specifier", () => {
    const src = `import x from "@/components/ui/button"\n`
    const config: Config = {
      ...baseConfig,
      aliases: { ...DEFAULT_ALIASES, ui: "@/ui", components: "@/comp" },
    }
    const out = rewriteImports(src, config)
    expect(out).toContain(`"@/ui/button"`)
    expect(out).not.toContain("@/comp")
  })
})

describe("aliasToDir", () => {
  it("joins an @/ alias onto the base dir", () => {
    expect(aliasToDir("@/components/ui", "/proj/src")).toBe(
      path.join("/proj/src", "components/ui")
    )
  })
})

describe("targetDirForType", () => {
  it("routes ui/lib/hook to the right alias dir", () => {
    const base = "/proj/src"
    expect(targetDirForType("registry:ui", baseConfig.aliases, base)).toBe(
      path.join(base, "components/ui")
    )
    expect(targetDirForType("registry:lib", baseConfig.aliases, base)).toBe(
      path.join(base, "lib")
    )
    expect(targetDirForType("registry:hook", baseConfig.aliases, base)).toBe(
      path.join(base, "hooks")
    )
  })
})

describe("resolveBaseDir", () => {
  let dir: string
  beforeAll(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "lb-paths-"))
  })
  afterAll(async () => {
    await fs.rm(dir, { recursive: true, force: true })
  })

  it("reads @/* from tsconfig paths", async () => {
    const proj = path.join(dir, "with-tsconfig")
    await fs.mkdir(proj, { recursive: true })
    await fs.writeFile(
      path.join(proj, "tsconfig.json"),
      JSON.stringify({ compilerOptions: { paths: { "@/*": ["./src/*"] } } })
    )
    expect(await resolveBaseDir(proj)).toBe(path.resolve(proj, ".", "./src"))
  })

  it("falls back to ./src when it exists", async () => {
    const proj = path.join(dir, "with-src")
    await fs.mkdir(path.join(proj, "src"), { recursive: true })
    expect(await resolveBaseDir(proj)).toBe(path.join(proj, "src"))
  })

  it("falls back to cwd when nothing matches", async () => {
    const proj = path.join(dir, "bare")
    await fs.mkdir(proj, { recursive: true })
    expect(await resolveBaseDir(proj)).toBe(proj)
  })
})
