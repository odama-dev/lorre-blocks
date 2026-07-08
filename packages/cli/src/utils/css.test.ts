import { describe, expect, it } from "vitest"

import { THEME_START, THEME_END, hasTheme, injectThemeBlock } from "./css"

const theme = ":root { --primary: 0 0% 10%; }"

describe("injectThemeBlock", () => {
  it("creates content with the tailwind import when empty", () => {
    const out = injectThemeBlock("", theme)
    expect(out).toContain('@import "tailwindcss";')
    expect(out).toContain(THEME_START)
    expect(out).toContain(theme)
    expect(out).toContain(THEME_END)
  })

  it("inserts after an existing tailwind import", () => {
    const out = injectThemeBlock('@import "tailwindcss";\n', theme)
    const importIdx = out.indexOf('@import "tailwindcss";')
    const themeIdx = out.indexOf(THEME_START)
    expect(importIdx).toBeGreaterThanOrEqual(0)
    expect(themeIdx).toBeGreaterThan(importIdx)
  })

  it("is idempotent — running twice does not duplicate", () => {
    const once = injectThemeBlock("", theme)
    const twice = injectThemeBlock(once, theme)
    expect(twice).toBe(once)
    expect(twice.match(new RegExp(escape(THEME_START), "g"))?.length).toBe(1)
  })

  it("replaces an existing block with new theme content", () => {
    const once = injectThemeBlock("", theme)
    const updated = injectThemeBlock(once, ":root { --primary: 1 2% 3%; }")
    expect(updated).toContain("--primary: 1 2% 3%")
    expect(updated).not.toContain("--primary: 0 0% 10%")
  })

  it("hasTheme reflects presence", () => {
    expect(hasTheme("")).toBe(false)
    expect(hasTheme(injectThemeBlock("", theme))).toBe(true)
  })
})

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
