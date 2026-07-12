import { describe, expect, it } from "vitest"

import { resolveTheme, themeDefinitionSchema, themeToCss } from "@lorre-blocks/tokens"
import { THEME_JSON_EXAMPLE } from "@www/app/docs/theming/page"

/**
 * The docs promise agents they can author a lorre.theme.json from the example
 * alone — so the example must always parse, validate against the real schema,
 * and generate CSS. If the schema evolves, this fails before the docs lie.
 */
describe("documented lorre.theme.json example", () => {
  it("is valid JSON that passes the shared schema", () => {
    const parsed = JSON.parse(THEME_JSON_EXAMPLE)
    const result = themeDefinitionSchema.safeParse(parsed)
    expect(
      result.success,
      result.success ? "" : JSON.stringify(result.error.issues, null, 2)
    ).toBe(true)
  })

  it("resolves and generates CSS end-to-end", () => {
    const def = JSON.parse(THEME_JSON_EXAMPLE)
    const css = themeToCss(resolveTheme(def))
    expect(css).toContain("--accent-9: oklch(0.54 0.25 293);")
    expect(css).toContain("--secondary-9:")
    expect(css).toContain("--button-radius: 9999px;")
  })
})
