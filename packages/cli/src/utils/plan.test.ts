import { describe, expect, it } from "vitest"

import {
  injectOverridesBlock,
  overridesToCss,
  stripOverridesBlock,
  themeIsInline,
  validatePlanShape,
  OVERRIDES_END,
  OVERRIDES_START,
} from "./plan"

const validPlan = {
  name: "acme-landing",
  theme: { name: "dreamy" },
  add: ["navbar", "hero", "footer"],
  pages: [{ path: "/", blocks: ["navbar", "hero", "footer"] }],
  tokenOverrides: { primary: "accent-10" },
  gaps: [{ need: "logo carousel", decision: "create" as const }],
}

describe("validatePlanShape", () => {
  it("accepts a full valid plan", () => {
    expect(validatePlanShape(validPlan)).toEqual([])
  })

  it("accepts a minimal plan", () => {
    expect(
      validatePlanShape({ name: "x", theme: { name: "basic" }, add: ["button"] })
    ).toEqual([])
  })

  it("rejects non-objects and collects multiple problems", () => {
    expect(validatePlanShape(null)).toHaveLength(1)
    const problems = validatePlanShape({ name: "Not Kebab", add: [] })
    expect(problems.some((p) => p.includes('"name"'))).toBe(true)
    expect(problems.some((p) => p.includes('"theme"'))).toBe(true)
    expect(problems.some((p) => p.includes('"add"'))).toBe(true)
  })

  it("rejects pages referencing items missing from add", () => {
    const problems = validatePlanShape({
      ...validPlan,
      pages: [{ path: "/", blocks: ["pricing"] }],
    })
    expect(problems).toEqual([
      expect.stringContaining('page "/" references "pricing"'),
    ])
  })

  it("rejects bad tokenOverrides values and keys", () => {
    const problems = validatePlanShape({
      ...validPlan,
      tokenOverrides: { primary: "hotpink", NotKebab: "accent-9", muted: "accent-13" },
    })
    expect(problems.some((p) => p.includes("tokenOverrides.primary"))).toBe(true)
    expect(problems.some((p) => p.includes('key "NotKebab"'))).toBe(true)
    expect(problems.some((p) => p.includes("tokenOverrides.muted"))).toBe(true)
  })

  it("rejects bad gap decisions", () => {
    const problems = validatePlanShape({
      ...validPlan,
      gaps: [{ need: "x", decision: "fork" }],
    })
    expect(problems).toEqual([expect.stringContaining('"sculpt" or "create"')])
  })

  it("accepts an inline theme definition (7.3)", () => {
    expect(
      validatePlanShape({
        name: "x",
        theme: {
          name: "acme",
          description: "inline custom theme",
          extends: "basic",
          colors: { accent: { hue: 150, chroma: 0.15, lightness: 0.55 } },
        },
        add: ["button"],
      })
    ).toEqual([])
  })

  it("validates inline themes against the lorre.theme.json contract", () => {
    const problems = validatePlanShape({
      name: "x",
      theme: {
        name: "acme",
        description: "bad inline theme",
        extends: "nope",
        spacing: { scaling: 9 },
      },
      add: ["button"],
    })
    expect(problems.some((p) => p.startsWith("theme.spacing.scaling:"))).toBe(true)
    // extends is checked after shape passes; scaling problem surfaces first
  })

  it("detects inline vs reference themes", () => {
    expect(themeIsInline({ name: "basic" })).toBe(false)
    expect(themeIsInline({ name: "basic", $comment: "hi" })).toBe(false)
    expect(themeIsInline({ name: "acme", description: "x" })).toBe(true)
  })
})

describe("overridesToCss", () => {
  it("re-declares every override under .dark (the Phase 1 dark-mode rule)", () => {
    const css = overridesToCss({ primary: "accent-10", ring: "accent-8" })
    const rootDecls = css.split(".dark")[0]
    const darkDecls = css.split(".dark")[1]
    for (const decl of ["--primary: var(--accent-10);", "--ring: var(--accent-8);"]) {
      expect(rootDecls).toContain(decl)
      expect(darkDecls).toContain(decl)
    }
  })

  it("is deterministic regardless of key order", () => {
    expect(overridesToCss({ b: "accent-1", a: "accent-2" })).toBe(
      overridesToCss({ a: "accent-2", b: "accent-1" })
    )
  })
})

describe("injectOverridesBlock / stripOverridesBlock", () => {
  const themeBlock =
    '@import "tailwindcss";\n\n/* lorre-blocks theme start */\n:root {}\n/* lorre-blocks theme end */\n'

  it("inserts directly after the theme block", () => {
    const next = injectOverridesBlock(themeBlock, ":root { --x: 1; }")
    expect(next.indexOf(OVERRIDES_START)).toBeGreaterThan(
      next.indexOf("/* lorre-blocks theme end */")
    )
    expect(next).toContain(`${OVERRIDES_START}\n:root { --x: 1; }\n${OVERRIDES_END}`)
  })

  it("replaces an existing block instead of duplicating", () => {
    const once = injectOverridesBlock(themeBlock, ":root { --x: 1; }")
    const twice = injectOverridesBlock(once, ":root { --x: 2; }")
    expect(twice.match(new RegExp("overrides start", "g"))).toHaveLength(1)
    expect(twice).toContain("--x: 2")
    expect(twice).not.toContain("--x: 1")
  })

  it("strip removes the block and is a no-op without one", () => {
    const withBlock = injectOverridesBlock(themeBlock, ":root { --x: 1; }")
    expect(stripOverridesBlock(withBlock)).not.toContain(OVERRIDES_START)
    expect(stripOverridesBlock(themeBlock)).toBe(themeBlock)
  })
})
