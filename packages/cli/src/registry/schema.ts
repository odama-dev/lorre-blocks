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

export interface RegistryItem {
  name: string
  type: RegistryItemType
  description?: string
  // Classification metadata (registry schema v2). Optional so the CLI keeps
  // working against older registries.
  source?: string
  category?: string
  themes?: string[]
  tokenType?: string
  tags?: string[]
  license?: string
  checksum?: string
  dependencies?: string[]
  registryDependencies?: string[]
  files: RegistryItemFile[]
}
