/**
 * Registry schema v2 — adds the Lorre classification system.
 *
 * Every item is classified along four axes (see lorre.md):
 *  1. source    — origin library the item was ported from ("lorre" = native)
 *  2. themes    — which Lorre themes the item is designed for (omitted = theme-agnostic)
 *  3. category  — functional grouping (token, component, block, motion, ...)
 *  4. tokenType — for category "token" only: which token family it belongs to
 */

export const REGISTRY_SCHEMA_VERSION = 2

export type RegistryItemType =
  | "registry:ui"
  | "registry:lib"
  | "registry:hook"
  | "registry:token"
  | "registry:theme"
  | "registry:block"
  | "registry:motion"
  | "registry:icon"
  | "registry:asset"

/** Origin of the item. Ported code keeps its source; rewritten-from-scratch code is "lorre". */
export type RegistrySource = "shadcn" | "magicui" | "radix" | "reactbits" | "lorre"

export type RegistryCategory =
  | "token"
  | "component"
  | "block"
  | "motion"
  | "icon"
  | "illustration"
  | "asset"
  | "lib"

export type RegistryTokenType =
  | "color"
  | "typography"
  | "spacing"
  | "layout"
  | "radius"
  | "shadow"
  | "motion"

export interface RegistryItemFile {
  path: string
  type: RegistryItemType
}

export interface RegistryItem {
  name: string
  type: RegistryItemType
  /** Required — agents rely on this to pick items. */
  description: string
  source: RegistrySource
  category: RegistryCategory
  /** Themes this item is designed for. Omitted = works with every theme. */
  themes?: string[]
  /** Only for category "token". */
  tokenType?: RegistryTokenType
  /** Free-form search keywords for agents. */
  tags?: string[]
  /** License of the origin source, e.g. "MIT". Required when source is not "lorre". */
  license?: string
  dependencies?: string[]
  registryDependencies?: string[]
  files: RegistryItemFile[]
}

export interface BuiltRegistryFile extends RegistryItemFile {
  content: string
}

export interface BuiltRegistryItem extends Omit<RegistryItem, "files"> {
  files: BuiltRegistryFile[]
  /** sha256 over the concatenated file contents — integrity check for consumers. */
  checksum: string
}

/** Shape of one entry in /r/index.json (kept as a flat array for CLI back-compat). */
export interface RegistryIndexItem {
  name: string
  type: RegistryItemType
  description: string
  source: RegistrySource
  category: RegistryCategory
  themes?: string[]
  tokenType?: RegistryTokenType
  tags?: string[]
  license?: string
  dependencies?: string[]
  registryDependencies?: string[]
  checksum: string
}

/** Shape of /r/manifest.json — registry-level metadata, new in schema v2. */
export interface RegistryManifest {
  schemaVersion: number
  itemCount: number
  sources: RegistrySource[]
  categories: RegistryCategory[]
  themes: string[]
}
