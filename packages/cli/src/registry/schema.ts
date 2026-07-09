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

export interface RegistryItemFile {
  path: string
  type: RegistryItemType
  content: string
}

/** Classification metadata (registry schema v2). Optional so the CLI keeps
 * working against older registries. */
export interface RegistryItemMeta {
  name: string
  type: RegistryItemType
  description?: string
  source?: string
  category?: string
  themes?: string[]
  tokenType?: string
  tags?: string[]
  license?: string
  checksum?: string
  dependencies?: string[]
  registryDependencies?: string[]
}

/** One entry of /r/index.json — metadata without file contents. */
export type RegistryIndexItem = RegistryItemMeta

export interface RegistryItem extends RegistryItemMeta {
  files: RegistryItemFile[]
}
