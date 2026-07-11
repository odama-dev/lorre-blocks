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
`

const CLI_MD = `# CLI reference

Package: \`lorre-blocks\` on npm. Requires Node >=22.12.

## Commands

- \`init [--theme <name>] [--yes]\` — scaffold theme CSS, utils, components.json; installs base deps (clsx, tailwind-merge, class-variance-authority, tw-animate-css)
- \`add <name...>\` — copy components + their registry dependencies into your project, install npm deps
- \`list\` — list all registry items
- \`search <query> [--category|--source|--theme|--type|--limit]\` — faceted search
- \`info <name>\` — metadata, install order, resolved target paths
- \`diff <name>\` — compare installed source against the registry
- \`theme list\` / \`theme apply <name>\` — manage the active theme

## Agent usage

Every command accepts \`--json\`: exactly one JSON document on stdout,
\`{"ok": false, "error": ...}\` + exit code 1 on failure, and \`--json\` implies
non-interactive (no prompts). Package-manager output is captured so stdout stays parseable.

Custom registry: \`--registry <url>\` or the \`registry\` field in components.json.
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
    `- [Theming](${SITE}/docs/theming.md): the 3 themes, theme CLI commands, DTCG token endpoints`,
    `- [CLI reference](${SITE}/docs/cli.md): every command incl. --json agent mode`,
    "",
    "## Blocks",
    "",
    ...blockItems.map(
      (item) =>
        `- [${item.name}](${SITE}/docs/blocks/${item.name}.md): ${item.description}`
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
    ...uiItems.flatMap((item) => [componentMd(item, sources.get(item.name)!), "---", ""]),
  ].join("\n")
  await fs.writeFile(path.join(PUBLIC_DIR, "llms-full.txt"), full, "utf8")
  console.log("✓ llms-full.txt")
}

build().catch((err) => {
  console.error(err)
  process.exit(1)
})
