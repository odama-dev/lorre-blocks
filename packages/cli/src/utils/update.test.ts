import { describe, expect, it } from "vitest"

import { sha256 } from "./lock"
import { decideUpdate } from "./update"

const installed = "installed content"
const hash = sha256(installed)
const upstreamV2 = "upstream v2 content"
const edited = "locally edited content"

describe("decideUpdate", () => {
  it("keeps files that already match the registry", () => {
    expect(decideUpdate(installed, installed, hash, false)).toEqual({
      action: "keep",
      reason: "up-to-date",
    })
  })

  it("writes when only the registry moved", () => {
    expect(decideUpdate(installed, upstreamV2, hash, false)).toEqual({
      action: "write",
      reason: "upstream",
    })
  })

  it("keeps local edits when the registry is unchanged", () => {
    expect(decideUpdate(edited, installed, hash, false)).toEqual({
      action: "keep",
      reason: "local",
    })
  })

  it("skips diverged files without --force and writes with it", () => {
    expect(decideUpdate(edited, upstreamV2, hash, false)).toEqual({
      action: "skip",
      reason: "both",
    })
    expect(decideUpdate(edited, upstreamV2, hash, true)).toEqual({
      action: "write",
      reason: "both",
    })
  })

  it("skips untracked files without --force and writes with it", () => {
    expect(decideUpdate(edited, upstreamV2, undefined, false)).toEqual({
      action: "skip",
      reason: "unknown",
    })
    expect(decideUpdate(edited, upstreamV2, undefined, true)).toEqual({
      action: "write",
      reason: "unknown",
    })
  })

  it("restores locally deleted files only with --force", () => {
    expect(decideUpdate(null, upstreamV2, hash, false)).toEqual({
      action: "skip",
      reason: "missing",
    })
    expect(decideUpdate(null, upstreamV2, hash, true)).toEqual({
      action: "write",
      reason: "missing",
    })
  })
})
