/**
 * Icon-set catalog (Phase 7.1). One entry per supported set; the www /icons
 * page, the CLI (`theme create --icons`), and `/r/icons/index.json` all
 * derive from this list, so adding a set here is the single source change.
 *
 * Permissive licenses only. Untitled UI is a UX reference, not a source —
 * its icons are proprietary and must never be added here.
 */

export interface IconSetInfo {
  /** Catalog id, used in `icons.set` config. */
  name: string
  label: string
  /** npm package installed into the consumer project. */
  package: string
  /**
   * Style/weight variants the set ships, empty = single style. `icons.style`
   * must be one of these when present.
   */
  styles: readonly string[]
  license: string
  homepage: string
}

export const ICON_SETS = [
  {
    name: "lucide",
    label: "Lucide",
    package: "lucide-react",
    styles: [],
    license: "ISC",
    homepage: "https://lucide.dev",
  },
  {
    name: "radix",
    label: "Radix Icons",
    package: "@radix-ui/react-icons",
    styles: [],
    license: "MIT",
    homepage: "https://www.radix-ui.com/icons",
  },
  {
    name: "phosphor",
    label: "Phosphor",
    package: "@phosphor-icons/react",
    styles: ["thin", "light", "regular", "bold", "fill", "duotone"],
    license: "MIT",
    homepage: "https://phosphoricons.com",
  },
  {
    name: "heroicons",
    label: "Heroicons",
    package: "@heroicons/react",
    styles: ["outline", "solid", "mini"],
    license: "MIT",
    homepage: "https://heroicons.com",
  },
] as const satisfies readonly IconSetInfo[]

export type IconSetName = (typeof ICON_SETS)[number]["name"]

export const DEFAULT_ICON_SET: IconSetName = "lucide"

export function getIconSet(name: string): IconSetInfo | undefined {
  return ICON_SETS.find((s) => s.name === name)
}
