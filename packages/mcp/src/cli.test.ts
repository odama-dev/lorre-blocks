import { describe, expect, it } from "vitest"

import {
  buildAddArgs,
  buildInfoArgs,
  buildSearchArgs,
  buildThemeApplyArgs,
  buildThemeListArgs,
  resolveCliBin,
} from "./cli"

describe("arg builders", () => {
  it("search: bare query", () => {
    expect(buildSearchArgs({ query: "text field" })).toEqual(["search", "text field"])
  })

  it("search: facets only, no query", () => {
    expect(
      buildSearchArgs({ category: "block", source: "lorre", limit: 5 })
    ).toEqual(["search", "--category", "block", "--source", "lorre", "--limit", "5"])
  })

  it("search: custom registry", () => {
    expect(buildSearchArgs({ query: "x", registry: "http://localhost:3200" })).toEqual([
      "search",
      "x",
      "--registry",
      "http://localhost:3200",
    ])
  })

  it("info always includes file contents", () => {
    expect(buildInfoArgs("button")).toEqual(["info", "button", "--files"])
  })

  it("add targets the project dir and only overwrites when asked", () => {
    expect(buildAddArgs(["hero", "cta"], "/proj")).toEqual([
      "add",
      "hero",
      "cta",
      "--cwd",
      "/proj",
    ])
    expect(buildAddArgs(["hero"], "/proj", true)).toEqual([
      "add",
      "hero",
      "--cwd",
      "/proj",
      "--overwrite",
    ])
  })

  it("theme apply / list", () => {
    expect(buildThemeApplyArgs("dreamy", "/proj")).toEqual([
      "theme",
      "apply",
      "dreamy",
      "--cwd",
      "/proj",
    ])
    expect(buildThemeListArgs()).toEqual([
      "theme",
      "list",
      "--registry",
      "https://lorre-blocks.vercel.app",
    ])
    expect(buildThemeListArgs("http://localhost:3200")).toEqual([
      "theme",
      "list",
      "--registry",
      "http://localhost:3200",
    ])
  })
})

describe("resolveCliBin", () => {
  it("resolves to the lorre-blocks dist entry", () => {
    expect(resolveCliBin().replace(/\\/g, "/")).toMatch(/lorre-blocks.*dist\/index\.js$/)
  })
})
