import { readFileSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { allResolvedThemes, themeToCss } from "@lorre-blocks/tokens"

/**
 * Components reference their tokens as bare `var(--button-height-sm)`. CSS has
 * no error for an undefined custom property — the declaration is simply invalid
 * at computed-value time and the button silently loses its height. Tailwind is
 * no help either: it happily emits `height: var(--button-height-sm)` without
 * ever checking that anything defines it.
 *
 * So nothing in the toolchain fails when a theme forgets a token. This does.
 */

const UI_DIR = path.resolve(__dirname, "../../../packages/registry/src/ui")

/** Every `--foo-bar` a component file reads through `(--x)` or `(length:--x)`. */
function referencedVars(component: string): string[] {
  const source = readFileSync(path.join(UI_DIR, `${component}.tsx`), "utf8")
  const found = new Set<string>()
  for (const match of source.matchAll(/\((?:length:)?(--[a-z0-9-]+)\)/g)) {
    found.add(match[1])
  }
  return [...found].sort()
}

/** Custom properties declared anywhere in a theme's stylesheet. */
function declaredVars(css: string): Set<string> {
  const found = new Set<string>()
  for (const match of css.matchAll(/^\s*(--[a-z0-9-]+):/gm)) {
    found.add(match[1])
  }
  return found
}

const themes = allResolvedThemes().map((theme) => ({
  name: theme.name,
  declared: declaredVars(themeToCss(theme)),
}))

describe.each(["button", "input"])("%s token contract", (component) => {
  const referenced = referencedVars(component)
  // Guards the regex above: a rename that breaks extraction would otherwise
  // leave this suite passing over an empty list.
  const own = referenced.filter((v) => v.startsWith(`--${component}-`))

  it("reads its tokens as CSS variables", () => {
    expect(own.length).toBeGreaterThan(0)
  })

  it.each(themes)("$name defines every token it reads", ({ declared }) => {
    const missing = own.filter((v) => !declared.has(v))
    expect(missing).toEqual([])
  })
})

describe("button sizes are fully themeable", () => {
  const referenced = referencedVars("button")

  // The point of the exercise: `sm` and `lg` used to hardcode h-8/px-3/text-xs
  // and h-10/px-8, so a theme could restyle the default button and leave the
  // other two untouched. Every size must now go through a token.
  it.each(["sm", "lg"])("size %s takes height, padding and font-size from tokens", (size) => {
    expect(referenced).toEqual(
      expect.arrayContaining([
        `--button-height-${size}`,
        `--button-px-${size}`,
        `--button-font-size-${size}`,
      ])
    )
  })

  it("leaves no bare Tailwind size utilities behind", () => {
    const source = readFileSync(path.join(UI_DIR, "button.tsx"), "utf8")
    const sizeBlock = source.slice(
      source.indexOf("size: {"),
      source.indexOf("}", source.indexOf("size: {"))
    )
    // The lookbehind keeps `--button-px-sm` from reading as a bare `px-s`.
    expect(sizeBlock).not.toMatch(/(?<![-\w])(h|px|text)-(?!\()[a-z0-9]/)
  })
})
