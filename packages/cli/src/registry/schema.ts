export type RegistryItemType = "registry:ui" | "registry:lib" | "registry:hook"

export interface RegistryItemFile {
  path: string
  type: RegistryItemType
  content: string
}

export interface RegistryItem {
  name: string
  type: RegistryItemType
  description?: string
  dependencies?: string[]
  registryDependencies?: string[]
  files: RegistryItemFile[]
}
