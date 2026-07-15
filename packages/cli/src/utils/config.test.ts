import { afterEach, describe, expect, it, vi } from "vitest"

import { DEFAULT_THEME, ROOT_THEME } from "./config"
import { fetchThemeCss } from "./registry"

/**
 * DEFAULT_THEME and ROOT_THEME were one constant, and the two roles it played
 * pull in opposite directions: the house theme is a preference that moves,
 * while the root of the `extends` chain is a fact about the registry's shape.
 * Collapsing them again would break the paths below quietly, so they are
 * pinned here rather than left to reviewer memory.
 */
describe("theme constants", () => {
  it("starts new projects on the house theme", () => {
    expect(DEFAULT_THEME).toBe("odama")
  })

  it("keeps basic as the root of the extends chain", () => {
    expect(ROOT_THEME).toBe("basic")
  })
})

function mockFetch(map: Record<string, { status: number; body?: unknown }>) {
  return vi.fn(async (url: string) => {
    const key = Object.keys(map).find((k) => url.endsWith(k))
    const entry = key ? map[key] : { status: 404 }
    return {
      ok: entry.status >= 200 && entry.status < 300,
      status: entry.status,
      json: async () => entry.body,
    } as Response
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("fetchThemeCss against a registry that predates named themes", () => {
  // Such a registry serves exactly one theme, on the legacy endpoint. The
  // fallback must key off ROOT_THEME: keying it off DEFAULT_THEME would ask a
  // pre-themes registry for odama, which it has never heard of.
  it("falls back to the legacy endpoint for the root theme", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({
        "/r/theme.json": { status: 200, body: { css: ":root { --legacy: 1 }" } },
      })
    )

    await expect(fetchThemeCss("https://example.test", ROOT_THEME)).resolves.toBe(
      ":root { --legacy: 1 }"
    )
  })

  it("does not serve the house theme from the legacy endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({
        "/r/theme.json": { status: 200, body: { css: ":root { --legacy: 1 }" } },
      })
    )

    await expect(
      fetchThemeCss("https://example.test", DEFAULT_THEME)
    ).rejects.toThrow(/was not found in the registry/)
  })
})
