import { classifyChange } from "./lock"

export type UpdateAction = "write" | "keep" | "skip"

export type UpdateReason =
  | "up-to-date"
  | "upstream" // registry moved, local untouched -> safe to write
  | "local" // local edits, registry unchanged -> nothing to update
  | "both" // diverged -> only --force writes
  | "unknown" // no lock entry -> only --force writes
  | "missing" // file deleted locally -> only --force restores

export interface UpdateDecision {
  action: UpdateAction
  reason: UpdateReason
}

/**
 * Per-file update policy. `update` only ever writes when it is provably safe
 * (the local file still matches what an install wrote) — everything else
 * needs --force. "local" is a keep, not a skip: the registry didn't move,
 * so there is nothing to update and nothing to warn about.
 */
export function decideUpdate(
  local: string | null,
  registryContent: string,
  lockedHash: string | undefined,
  force: boolean
): UpdateDecision {
  if (local === null) {
    return { action: force ? "write" : "skip", reason: "missing" }
  }
  if (local === registryContent) {
    return { action: "keep", reason: "up-to-date" }
  }
  const cause = classifyChange(local, registryContent, lockedHash)
  switch (cause) {
    case "upstream":
      return { action: "write", reason: "upstream" }
    case "local":
      return { action: "keep", reason: "local" }
    case "both":
      return { action: force ? "write" : "skip", reason: "both" }
    case "unknown":
      return { action: force ? "write" : "skip", reason: "unknown" }
  }
}
