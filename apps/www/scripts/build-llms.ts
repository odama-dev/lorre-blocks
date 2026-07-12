/**
 * Generates agent-readable docs at prebuild time (Phase 3.2):
 *   public/llms.txt                    — llmstxt.org index: what this site is + links
 *   public/llms-full.txt               — everything inline: guides + every component/block doc
 *   public/docs/components/<name>.md   — raw-markdown twin of each component page
 *   public/docs/blocks/<name>.md       — raw-markdown twin of each block page
 *   public/docs/index.md, theming.md, cli.md — twins of the static docs pages
 *
 * Output is deterministic (registry order is sorted; no timestamps) so rebuilds
 * with no source changes produce no diff. Everything under public/docs/*.md and
 * the two llms files is gitignored, like public/r/.
 */
import { promises as fs } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { registry } from "@lorre-blocks/registry/registry"
import type { RegistryItem } from "@lorre-blocks/registry/schema"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WWW_ROOT = path.resolve(__dirname, "..")
const PUBLIC_DIR = path.join(WWW_ROOT, "public")
const REGISTRY_SRC = path.resolve(WWW_ROOT, "..", "..", "packages", "registry", "src")

const SITE = "https://lorre-blocks.vercel.app"

const uiItems = registry
  .filter((item) => item.type === "registry:ui")
  .sort((a, b) => a.name.localeCompare(b.name))

const blockItems = registry
  .filter((item) => item.type === "registry:block")
  .sort((a, b) => a.name.localeCompare(b.name))

const motionItems = registry
  .filter((item) => item.type === "registry:motion")
  .sort((a, b) => a.name.localeCompare(b.name))

async function readSource(item: RegistryItem): Promise<string> {
  return fs.readFile(path.join(REGISTRY_SRC, item.files[0].path), "utf8")
}

function componentMd(item: RegistryItem, source: string): string {
  const lines = [
    `# ${item.name}`,
    "",
    item.description,
    "",
    `- **Source**: ${item.source}${item.license ? ` (${item.license})` : ""}`,
    `- **Install**: \`npx lorre-blocks add ${item.name}\``,
  ]
  if (item.registryDependencies?.length) {
    lines.push(
      `- **Registry dependencies** (installed automatically): ${item.registryDependencies.join(", ")}`
    )
  }
  if (item.dependencies?.length) {
    lines.push(`- **npm dependencies**: ${item.dependencies.join(", ")}`)
  }
  if (item.tags?.length) {
    lines.push(`- **Tags**: ${item.tags.join(", ")}`)
  }
  lines.push(
    "",
    "## Source",
    "",
    "```tsx",
    source.trimEnd(),
    "```",
    ""
  )
  return lines.join("\n")
}

const INDEX_MD = `# Lorre Blocks

A design token + component registry for Lorre projects: Radix-style token/theme
architecture with shadcn-style CLI distribution. Components are copied into your
project as source — you own the code.

## Quick start

\`\`\`bash
npx lorre-blocks init            # pick a theme, scaffold theme CSS + utils + components.json
npx lorre-blocks add button      # copy a component (and its dependencies) into your project
\`\`\`

Every command supports \`--json\` for machine-readable output:
\`npx lorre-blocks search <query> --json\`, \`npx lorre-blocks info <name> --json\`.

## Registry endpoints

- \`${SITE}/r/manifest.json\` — schema version, item count, sources, categories, themes
- \`${SITE}/r/index.json\` — all items with metadata (no file contents)
- \`${SITE}/r/<name>.json\` — one item incl. source files and checksum
- \`${SITE}/r/themes/index.json\` and \`${SITE}/r/themes/<name>.json\` — themes as Tailwind v4 CSS
- \`${SITE}/r/tokens/<name>.json\` — themes as W3C DTCG design tokens
- \`${SITE}/r/icons/index.json\` — supported icon sets (npm package, style variants, license)

## Custom design systems

Write a \`lorre.theme.json\` (contract in the Theming doc) and run
\`npx lorre-blocks theme create --from lorre.theme.json\` — colors, type scale,
radius, spacing density, per-component tokens and the icon set, generated locally
and injected into the global CSS. Humans get the same via the Theme Studio
(\`${SITE}/themes\`); icons browse at \`${SITE}/icons\`.
`

const THEMING_MD = `# Theming

A theme is data: five color seeds (neutral, accent, danger, success, warning) plus
radius, shadow, motion and typography values. Everything else — 12-step OKLCH scales,
semantic aliases, dark mode — is generated.

## Themes

- **basic** — the root theme: blue accent, balanced radii and shadows, 200ms motion. Every other theme extends it.
- **dreamy** — violet accent, large radii, plush shadows, slower motion. For expressive marketing and creative work.
- **utilitarian** — monochrome accent, sharp radii, minimal shadows, fast motion. For dense professional dashboards.

## Usage

\`\`\`bash
npx lorre-blocks init --theme dreamy    # scaffold with a theme
npx lorre-blocks theme list             # list available themes
npx lorre-blocks theme apply basic      # swap the theme block in your global CSS
\`\`\`

Swapping themes rewrites only the generated CSS block (\`/* lorre-blocks theme start|end */\`)
in your global stylesheet; component files are untouched. Dark mode: add the \`dark\` class
to a root element — every semantic variable is re-declared under \`.dark\`.

Theme JSON: \`${SITE}/r/themes/<name>.json\` (Tailwind v4 CSS) and
\`${SITE}/r/tokens/<name>.json\` (W3C DTCG).

## Custom themes (lorre.theme.json)

A custom theme is a JSON definition the CLI turns into injected CSS — same engine as
the Theme Studio (${SITE}/themes), byte-identical output. Write \`lorre.theme.json\`
in the project root and run \`npx lorre-blocks theme create --from lorre.theme.json\`.
Later edits: re-run \`npx lorre-blocks theme apply\` (no argument). Inspect the
resolved system anytime: \`npx lorre-blocks theme show --json\`.

The contract (every group optional; unknown keys are rejected; validation problems
come back as one flat list under \`--json\`):

\`\`\`jsonc
{
  "name": "acme",                    // required, kebab-case
  "description": "Acme brand theme", // required
  "extends": "basic",                // basic | dreamy | utilitarian (default basic)
  "colors": {
    // seeds: hue 0-360, chroma 0-0.5, lightness 0-1 (OKLCH); each grows into a
    // 12-step scale, light + dark. Scales: neutral, accent, danger, success,
    // warning, secondary (optional 6th brand scale — semantics remap to it).
    // Optional per-seed: "onSolid": "light"|"dark", "dark": {partial overrides}.
    "accent":    { "hue": 293, "chroma": 0.25, "lightness": 0.54 },
    "secondary": { "hue": 70,  "chroma": 0.16, "lightness": 0.77 }
  },
  "semantics": { "primary": "accent-9" },   // semantic -> scale-step overrides
  "typography": {
    "fontSans": ["Geist", "ui-sans-serif", "system-ui", "sans-serif"],
    "fontMono": ["JetBrains Mono", "ui-monospace", "monospace"],
    "typeScale": { "base": "1rem", "ratio": 1.2, "fluid": true }
    // -> fluid clamp() tokens --text-h1..h6/body/small (text-h1... utilities)
  },
  "radius": { "base": "1rem", "sm": "0.5rem", "md": "0.75rem",
              "lg": "1rem", "xl": "1.5rem", "2xl": "2rem" },
  "shadows": { "md": "0 4px 6px -1px oklch(0 0 0 / 0.1)" },
  "motion": { "durationFast": "120ms", "easeSmooth": [0.32, 0.72, 0, 1] },
  "spacing": { "scaling": 1.05 },    // 0.75-1.5; rescales every spacing utility
  "components": {
    // key set only; values are CSS lengths or var() refs
    "button":  { "radius": "9999px", "height": "calc(var(--spacing) * 9)", "px": "..." },
    "input":   { "radius": "...", "height": "...", "px": "..." },
    "card":    { "radius": "...", "padding": "..." },
    "panel":   { "radius": "...", "padding": "..." },   // dialog/alert-dialog/sheet
    "badge":   { "radius": "...", "px": "...", "py": "..." },
    "tabs":    { "radius": "...", "trigger-radius": "..." },
    "control": { "radius": "...", "size": "..." },      // checkbox/radio
    "tooltip": { "radius": "...", "px": "...", "py": "..." }
  },
  "icons": { "set": "phosphor", "style": "duotone" }
  // sets: lucide (no styles) | radix (no styles) |
  //       phosphor (thin/light/regular/bold/fill/duotone) |
  //       heroicons (outline/solid/mini) — catalog: ${SITE}/r/icons/index.json
}
\`\`\`

Flags compose with (and override) \`--from\`:
\`theme create --accent "#7C3AED" --neutral "#71717A" --secondary "#F59E0B"
--radius xl --font-sans Geist --type-base 1rem --type-ratio 1.2 --scaling 105
--icons phosphor:duotone\` (colors accept hex or an OKLCH triple \`h:c:l\`;
\`--icons\` also installs the set's npm package).

plan.json accepts the same definition inline as its \`theme\` value (any key beyond
\`name\` marks it inline); \`apply\` generates it locally and records lorre.theme.json.
`

const CLI_MD = `# CLI reference

Package: \`lorre-blocks\` on npm. Requires Node >=22.12.

## Commands

- \`init [--theme <name>] [--yes]\` — scaffold theme CSS, utils, components.json; installs base deps (clsx, tailwind-merge, class-variance-authority, tw-animate-css)
- \`add <name...>\` — copy components + their registry dependencies into your project, install npm deps
- \`list\` — list all registry items
- \`search <query> [--category|--source|--theme|--type|--limit]\` — faceted search
- \`info <name>\` — metadata, install order, resolved target paths
- \`diff [name...]\` — compare installed source against the registry; with lorre.lock present each modified file carries a \`cause\`: \`local\` (you edited), \`upstream\` (registry moved), \`both\` (diverged), \`unknown\` (pre-lock install). No-arg diff covers every locked item (ui, blocks, motion, lib).
- \`update [name...] [--force]\` — pull registry updates; rewrites only files whose content still hashes to what an install wrote (lorre.lock). Local edits are kept when the registry is unchanged; diverged/untracked/deleted files are skipped unless \`--force\`. New registry dependencies are added automatically.
- \`theme list\` / \`theme apply [name]\` — manage the active theme; without a name, apply regenerates from lorre.theme.json
- \`theme create [--from lorre.theme.json] [flags]\` — create a custom theme (see Theming doc for the JSON contract and flags); generates the CSS locally (engine is bundled — works offline) and injects it, records lorre.theme.json, installs the icon-set package
- \`theme show\` — print the active theme's resolved design system (color seeds, semantics, type scale, spacing, component tokens, icons); use it instead of parsing CSS
- \`plan check <plan.json>\` — validate a plan and resolve it against the registry (read-only; all problems in one pass). The plan's \`theme\` may be an inline lorre.theme.json definition
- \`apply <plan.json>\` — execute a plan: theme + token overrides + items in one run, records lorre.plan.json

## lorre.lock

\`init\`, \`add\`, \`apply\` and \`update\` record installs in \`lorre.lock\` (schema v1):
per item, the registry-declared checksum plus a sha256 per file of the content as
written. It powers diff attribution and safe updates. Commit it to version control.

## Agent usage

Every command accepts \`--json\`: exactly one JSON document on stdout,
\`{"ok": false, "error": ...}\` + exit code 1 on failure, and \`--json\` implies
non-interactive (no prompts). Package-manager output is captured so stdout stays parseable.

Custom registry: \`--registry <url>\` or the \`registry\` field in components.json.

## MCP server

\`lorre-blocks-mcp\` on npm (stdio): \`search_registry\`, \`get_component\`,
\`add_component\`, \`apply_theme\`, \`create_theme\`, \`show_theme\`, \`list_themes\` —
each tool is one CLI \`--json\` invocation. Setup:
\`claude mcp add lorre-blocks -- npx -y lorre-blocks-mcp\`.
`

async function build() {
  const componentsDir = path.join(PUBLIC_DIR, "docs", "components")
  await fs.mkdir(componentsDir, { recursive: true })

  const blocksDir = path.join(PUBLIC_DIR, "docs", "blocks")
  await fs.mkdir(blocksDir, { recursive: true })

  const sources = new Map<string, string>()
  for (const item of uiItems) {
    const source = await readSource(item)
    sources.set(item.name, source)
    await fs.writeFile(
      path.join(componentsDir, `${item.name}.md`),
      componentMd(item, source),
      "utf8"
    )
  }
  console.log(`✓ ${uiItems.length} component twins -> public/docs/components/<name>.md`)

  for (const item of blockItems) {
    const source = await readSource(item)
    sources.set(item.name, source)
    await fs.writeFile(
      path.join(blocksDir, `${item.name}.md`),
      componentMd(item, source),
      "utf8"
    )
  }
  console.log(`✓ ${blockItems.length} block twins -> public/docs/blocks/<name>.md`)

  const motionDir = path.join(PUBLIC_DIR, "docs", "motion")
  await fs.mkdir(motionDir, { recursive: true })
  for (const item of motionItems) {
    const source = await readSource(item)
    sources.set(item.name, source)
    await fs.writeFile(
      path.join(motionDir, `${item.name}.md`),
      componentMd(item, source),
      "utf8"
    )
  }
  console.log(`✓ ${motionItems.length} motion twins -> public/docs/motion/<name>.md`)

  await fs.writeFile(path.join(PUBLIC_DIR, "docs", "index.md"), INDEX_MD, "utf8")
  await fs.writeFile(path.join(PUBLIC_DIR, "docs", "theming.md"), THEMING_MD, "utf8")
  await fs.writeFile(path.join(PUBLIC_DIR, "docs", "cli.md"), CLI_MD, "utf8")
  console.log("✓ docs twins -> public/docs/{index,theming,cli}.md")

  const llms = [
    "# Lorre Blocks",
    "",
    "> Design token + component registry for Lorre projects: Radix-style themes,",
    "> shadcn-style CLI distribution (components are copied in as source), agent-first",
    "> (every CLI command supports --json; registry JSON is served statically).",
    "",
    "## Docs",
    "",
    `- [Introduction](${SITE}/docs/index.md): what Lorre Blocks is, quick start, registry endpoints`,
    `- [Theming](${SITE}/docs/theming.md): the 3 preset themes + the lorre.theme.json custom-theme contract (theme create)`,
    `- [CLI reference](${SITE}/docs/cli.md): every command incl. --json agent mode`,
    `- [Theme Studio](${SITE}/themes): tailor a design system visually; exports CSS / lorre.theme.json / the CLI command`,
    `- [Icons](${SITE}/icons): browse the supported icon sets, copy SVG/JSX; catalog at ${SITE}/r/icons/index.json`,
    "",
    "## Blocks",
    "",
    ...blockItems.map(
      (item) =>
        `- [${item.name}](${SITE}/docs/blocks/${item.name}.md): ${item.description}`
    ),
    "",
    "## Motion",
    "",
    ...motionItems.map(
      (item) =>
        `- [${item.name}](${SITE}/docs/motion/${item.name}.md): ${item.description}`
    ),
    "",
    "## Components",
    "",
    ...uiItems.map(
      (item) =>
        `- [${item.name}](${SITE}/docs/components/${item.name}.md): ${item.description}`
    ),
    "",
    "## Optional",
    "",
    `- [llms-full.txt](${SITE}/llms-full.txt): all of the above inlined in one file`,
    `- [Registry manifest](${SITE}/r/manifest.json): machine-readable registry summary`,
    "",
  ].join("\n")
  await fs.writeFile(path.join(PUBLIC_DIR, "llms.txt"), llms, "utf8")
  console.log("✓ llms.txt")

  const full = [
    llms,
    "---",
    "",
    INDEX_MD,
    "---",
    "",
    THEMING_MD,
    "---",
    "",
    CLI_MD,
    "---",
    "",
    ...blockItems.flatMap((item) => [componentMd(item, sources.get(item.name)!), "---", ""]),
    ...motionItems.flatMap((item) => [componentMd(item, sources.get(item.name)!), "---", ""]),
    ...uiItems.flatMap((item) => [componentMd(item, sources.get(item.name)!), "---", ""]),
  ].join("\n")
  await fs.writeFile(path.join(PUBLIC_DIR, "llms-full.txt"), full, "utf8")
  console.log("✓ llms-full.txt")
}

build().catch((err) => {
  console.error(err)
  process.exit(1)
})
