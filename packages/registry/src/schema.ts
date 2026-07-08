export type RegistryItemType = "registry:ui" | "registry:lib" | "registry:hook"

export interface RegistryItemFile {
  path: string
  type: RegistryItemType
}

export interface RegistryItem {
  name: string
  type: RegistryItemType
  description?: string
  dependencies?: string[]
  registryDependencies?: string[]
  files: RegistryItemFile[]
}

export interface BuiltRegistryFile extends RegistryItemFile {
  content: string
}

export interface BuiltRegistryItem extends Omit<RegistryItem, "files"> {
  files: BuiltRegistryFile[]
}
