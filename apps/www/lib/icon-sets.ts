import * as React from "react"
import { isPrivateIconSet, type IconSetName } from "@lorre-blocks/tokens"

/**
 * Per-set adapters for the /icons browser (Phase 7.5). Each set is loaded via
 * dynamic import so only the active set enters the client bundle. Everything
 * renders with `currentColor`, so icons follow the active theme + dark mode.
 */

/** Customizer state baked into JSX snippets (and, in the browser, the SVG). */
export interface IconRenderOptions {
  size?: number
  strokeWidth?: number
  /** A concrete CSS color; omit / "currentColor" means inherit the theme. */
  color?: string
}

export interface LoadedIconSet {
  /** kebab-case display name → component (style already applied where needed). */
  icons: Record<
    string,
    React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  >
  /** e.g. `import { ArrowRight } from "lucide-react"` */
  importLine: (displayName: string) => string
  /** e.g. `<ArrowRight size={24} strokeWidth={1.5} />` */
  jsxSnippet: (displayName: string, opts?: IconRenderOptions) => string
}

const hasColor = (opts?: IconRenderOptions) =>
  opts?.color && opts.color !== "currentColor"

/** `style={{ width: N, height: N, color: "..." }}` for sets without a size prop. */
function styleAttr(opts?: IconRenderOptions): string {
  const entries: string[] = []
  if (opts?.size) entries.push(`width: ${opts.size}`, `height: ${opts.size}`)
  if (hasColor(opts)) entries.push(`color: "${opts!.color}"`)
  return entries.length ? ` style={{ ${entries.join(", ")} }}` : ""
}

export async function loadIconSet(
  set: IconSetName,
  style: string | undefined
): Promise<LoadedIconSet> {
  // This app is public and its bundle is served to anyone. A private set's
  // package is not even installed here — fail loudly rather than let a future
  // edit quietly add the import.
  if (isPrivateIconSet(set)) {
    throw new Error(
      `Icon set "${set}" is private and is not available in the public docs app.`
    )
  }

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
        jsxSnippet: (name, opts) => {
          const attrs: string[] = []
          if (opts?.size) attrs.push(`size={${opts.size}}`)
          if (opts?.strokeWidth) attrs.push(`strokeWidth={${opts.strokeWidth}}`)
          if (hasColor(opts)) attrs.push(`color="${opts!.color}"`)
          return `<${pascal(name)}${attrs.length ? " " + attrs.join(" ") : ""} />`
        },
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
        jsxSnippet: (name, opts) => `<${pascal(name)}Icon${styleAttr(opts)} />`,
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
        jsxSnippet: (name, opts) => {
          const attrs = [`size={${opts?.size ?? 24}}`, `weight="${weight}"`]
          if (hasColor(opts)) attrs.push(`color="${opts!.color}"`)
          return `<${pascal(name)} ${attrs.join(" ")} />`
        },
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
        jsxSnippet: (name, opts) => `<${pascal(name)}Icon${styleAttr(opts)} />`,
      }
    }
  }

  throw new Error(`Unknown icon set "${set}".`)
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
