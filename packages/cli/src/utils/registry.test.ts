import { afterEach, describe, expect, it, vi } from "vitest"

import { fetchRegistryItem, resolveTree } from "./registry"
import type { RegistryItem } from "../registry/schema"

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

function item(name: string, deps: string[] = []): RegistryItem {
  return {
    name,
    type: "registry:ui",
    registryDependencies: deps,
    files: [{ path: `ui/${name}.tsx`, type: "registry:ui", content: "" }],
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("fetchRegistryItem", () => {
  it("returns the parsed item on 200", async () => {
    vi.stubGlobal("fetch", mockFetch({ "/r/button.json": { status: 200, body: item("button") } }))
    const result = await fetchRegistryItem("https://x.dev", "button")
    expect(result.name).toBe("button")
  })

  it("throws a clear error on 404", async () => {
    vi.stubGlobal("fetch", mockFetch({ "/r/nope.json": { status: 404 } }))
    await expect(fetchRegistryItem("https://x.dev", "nope")).rejects.toThrow(/not be found|not found/i)
  })

  it("throws on other non-ok status", async () => {
    vi.stubGlobal("fetch", mockFetch({ "/r/x.json": { status: 500 } }))
    await expect(fetchRegistryItem("https://x.dev", "x")).rejects.toThrow(/HTTP 500/)
  })
})

describe("resolveTree", () => {
  it("orders dependencies before dependents and de-dupes", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({
        "/r/button.json": { status: 200, body: item("button", ["utils"]) },
        "/r/input.json": { status: 200, body: item("input", ["utils"]) },
        "/r/utils.json": { status: 200, body: item("utils") },
      })
    )
    const tree = await resolveTree("https://x.dev", ["button", "input"])
    const names = tree.map((t) => t.name)
    expect(names).toEqual(["utils", "button", "input"])
    expect(names.filter((n) => n === "utils")).toHaveLength(1)
  })
})
