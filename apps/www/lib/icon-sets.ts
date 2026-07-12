import * as React from "react"
import type { IconSetName } from "@lorre-blocks/tokens"

/**
 * Per-set adapters for the /icons browser (Phase 7.5). Each set is loaded via
 * dynamic import so only the active set enters the client bundle. Everything
 * renders with `currentColor`, so icons follow the active theme + dark mode.
 */

export interface LoadedIconSet {
  /** kebab-case display name → component (style already applied where needed). */
  icons: Record<string, React.ComponentType<{ className?: string }>>
  /** e.g. `import { ArrowRight } from "lucide-react"` */
  importLine: (displayName: string) => string
  /** e.g. `<ArrowRight className="size-4" />` */
  jsxSnippet: (displayName: string) => string
}

export async function loadIconSet(
  set: IconSetName,
  style: string | undefined
): Promise<LoadedIconSet> {
  switch (set) {
    case "lucide": {
      const m = await import("lucide-react")
      const icons: LoadedIconSet["icons"] = {}
      for (const [pascal, component] of Object.entries(
        m.icons as Record<string, React.ComponentType<{ className?: string }>>
      )) {
        icons[kebab(pascal)] = component
      }
      return {
        icons,
        importLine: (name) => `import { ${pascal(name)} } from "lucide-react"`,
        jsxSnippet: (name) => `<${pascal(name)} className="size-4" />`,
      }
    }
    case "radix": {
      const m = (await import("@radix-ui/react-icons")) as Record<string, unknown>
      const icons: LoadedIconSet["icons"] = {}
      for (const key of Object.keys(m)) {
        if (!key.endsWith("Icon")) continue
        icons[kebab(key.slice(0, -4))] = m[key] as LoadedIconSet["icons"][string]
      }
      return {
        icons,
        importLine: (name) => `import { ${pascal(name)}Icon } from "@radix-ui/react-icons"`,
        jsxSnippet: (name) => `<${pascal(name)}Icon />`,
      }
    }
    case "phosphor": {
      const m = (await import("@phosphor-icons/react")) as Record<string, unknown>
      const weight = style ?? "regular"
      const icons: LoadedIconSet["icons"] = {}
      for (const key of Object.keys(m)) {
        // Every icon is exported twice (Acorn + AcornIcon); keep the bare name.
        if (!/^[A-Z]/.test(key) || key.endsWith("Icon")) continue
        if (key === "IconBase" || key === "IconContext" || key === "SSR") continue
        const Component = m[key] as React.ComponentType<{
          className?: string
          weight?: string
        }>
        const Wrapped = (props: { className?: string }) =>
          React.createElement(Component, { ...props, weight })
        Wrapped.displayName = key
        icons[kebab(key)] = Wrapped
      }
      return {
        icons,
        importLine: (name) => `import { ${pascal(name)} } from "@phosphor-icons/react"`,
        jsxSnippet: (name) => `<${pascal(name)} size={16} weight="${weight}" />`,
      }
    }
    case "heroicons": {
      const variant = style ?? "outline"
      const m = (await (variant === "outline"
        ? import("@heroicons/react/24/outline")
        : variant === "solid"
          ? import("@heroicons/react/24/solid")
          : import("@heroicons/react/20/solid"))) as Record<string, unknown>
      const subpath =
        variant === "outline"
          ? "@heroicons/react/24/outline"
          : variant === "solid"
            ? "@heroicons/react/24/solid"
            : "@heroicons/react/20/solid"
      const icons: LoadedIconSet["icons"] = {}
      for (const key of Object.keys(m)) {
        if (!key.endsWith("Icon")) continue
        icons[kebab(key.slice(0, -4))] = m[key] as LoadedIconSet["icons"][string]
      }
      return {
        icons,
        importLine: (name) => `import { ${pascal(name)}Icon } from "${subpath}"`,
        jsxSnippet: (name) => `<${pascal(name)}Icon className="size-4" />`,
      }
    }
  }
}

export function kebab(pascalName: string): string {
  return pascalName
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase()
}

export function pascal(kebabName: string): string {
  return kebabName
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")
}

/** Substring filter with startsWith ranking; empty query returns everything. */
export function searchIcons(names: string[], query: string): string[] {
  const q = query.trim().toLowerCase()
  if (!q) return names
  const starts: string[] = []
  const contains: string[] = []
  for (const name of names) {
    if (name.startsWith(q)) starts.push(name)
    else if (name.includes(q)) contains.push(name)
  }
  return [...starts, ...contains]
}
