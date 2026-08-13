/**
 * Icon-set catalog (Phase 7.1). One entry per supported set; the www /icons
 * page, the CLI (`theme create --icons`), and `/r/icons/index.json` all
 * derive from this list, so adding a set here is the single source change.
 *
 * Permissive licenses only for public sets. Untitled UI is a UX reference,
 * not a source — its icons are proprietary and must never be added here.
 *
 * Private sets (`private: true`) are the one exception, and they carry no
 * artwork in this repo — only the pointer to the package that does. See the
 * note on `IconSetInfo.private` for why that distinction is load-bearing.
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
  /**
   * Lorre-only set. This repo is public and so is everything Vercel serves
   * out of apps/www/public — so privacy CANNOT come from a flag here. It
   * comes from the package living on an authenticated npm registry; this
   * flag only stops us from *advertising* the set on public surfaces
   * (`/r/icons/index.json`, the /icons browser).
   *
   * Consequence worth knowing: the set's name and package still ship inside
   * the public CLI, because the CLI resolves `--icons` against this list.
   * That leaks the name, never the artwork. `npm install` is the real gate.
   */
  private?: boolean
  /** npm registry hosting the package. Omitted = public npm. */
  registry?: string
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
  {
    // Drawn in-house; source of truth is the "All Icon" Figma file. The six
    // styles are the curated slice of a 30-variant matrix (filled × stroke ×
    // radius × join) — radius and join are pinned to the house values, so
    // only stroke weight and fill stay open to consumers.
    name: "lorre",
    label: "Lorre Icons",
    // GitHub Packages resolves a scope to its owning org, so the scope has to
    // be @odama-dev — @lorre/icons would 404 there no matter who is authed.
    package: "@odama-dev/icons",
    styles: [
      "stroke-1",
      "stroke-1.5",
      "stroke-2",
      "filled-1",
      "filled-1.5",
      "filled-2",
    ],
    license: "UNLICENSED",
    homepage: "https://github.com/odama-dev/lorre-icons",
    private: true,
    registry: "https://npm.pkg.github.com",
  },
] as const satisfies readonly IconSetInfo[]

export type IconSetName = (typeof ICON_SETS)[number]["name"]

export const DEFAULT_ICON_SET: IconSetName = "lucide"

/**
 * The sets safe to publish, list, or render for anyone. Every public surface
 * MUST read this instead of ICON_SETS — see `IconSetInfo.private`.
 */
export const PUBLIC_ICON_SETS = ICON_SETS.filter(
  (s) => !("private" in s && s.private)
) as readonly IconSetInfo[]

export function getIconSet(name: string): IconSetInfo | undefined {
  return ICON_SETS.find((s) => s.name === name)
}

export function isPrivateIconSet(name: string): boolean {
  return getIconSet(name)?.private === true
}
