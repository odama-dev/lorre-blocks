import type { Metadata } from "next"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lorre-blocks/registry/ui/table"
import { CodeBlock, CommandSnippet } from "@www/components/code-block"

export const metadata: Metadata = { title: "CLI reference" }

const COMMANDS = [
  ["init [--theme <name>] [-y]", "Write components.json, install base deps, inject the theme."],
  ["add <names...> [-o]", "Copy components (and their registry dependencies) into your project."],
  ["list", "List every registry item."],
  ["search <query> [--category] [--source]", "Rank registry items against a query plus facet filters."],
  ["info <name> [--files]", "One item's metadata, dependencies and target paths."],
  ["diff [names...]", "Compare your local copies against the registry; with lorre.lock it reports who changed each file (local edits, registry update, or diverged)."],
  ["update [names...] [-f]", "Pull registry updates. Rewrites only files you have not edited (per lorre.lock); diverged files need --force."],
  ["theme list / theme apply [name]", "Inspect and swap themes. Without a name, apply regenerates from lorre.theme.json."],
  ["theme create [--from <file>] [flags]", "Create a custom theme: colors (hex or OKLCH), fonts, type scale, radius, scaling, component tokens, icon set. Generates the CSS locally and injects it."],
  ["theme show", "Print the active theme's resolved design system (scales, semantics, type scale, component tokens)."],
  ["plan check <plan.json>", "Validate a plan and resolve it against the registry (read-only). The plan's theme may be an inline custom definition."],
  ["apply <plan.json> [-o]", "Execute a plan: theme + token overrides + items in one run."],
]

export default function CliPage() {
  return (
    <article className="max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">CLI reference</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        The <code className="font-mono">lorre-blocks</code> CLI ships on npm.
        Every command below also takes{" "}
        <code className="font-mono">--json</code>: one JSON document on stdout,
        no prompts, ever.
      </p>

      <div className="mt-8 border border-dashed">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Command</TableHead>
              <TableHead>What it does</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {COMMANDS.map(([command, description]) => (
              <TableRow key={command}>
                <TableCell className="whitespace-nowrap font-mono text-xs">
                  {command}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {description}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <h2 className="mt-10 text-xl font-semibold">For agents</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        <code className="font-mono">--json</code> is the machine contract: pick
        components by searching, inspect before installing, then add — all
        without a TTY.
      </p>
      <div className="mt-4 space-y-3">
        <CommandSnippet command='npx lorre-blocks search "date input" --category component --json' />
        <CommandSnippet command="npx lorre-blocks info date-picker --json" />
        <CommandSnippet command="npx lorre-blocks add date-picker --yes --json" />
        <CommandSnippet command="npx lorre-blocks theme create --from lorre.theme.json --json" />
        <CommandSnippet command="npx lorre-blocks theme show --json" />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        To build a full design system, write a{" "}
        <code className="font-mono">lorre.theme.json</code> (see{" "}
        <a href="/docs/theming" className="underline underline-offset-4">
          Theming
        </a>
        ) and run <code className="font-mono">theme create</code> — validation
        problems come back as one flat JSON list.
      </p>

      <h2 className="mt-10 text-xl font-semibold">Registry endpoints</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        Everything the CLI reads is plain static JSON — usable directly.
      </p>
      <CodeBlock
        lang="txt"
        className="mt-4"
        code={`/r/index.json            all items with metadata + checksums
/r/manifest.json         schema version + facet summaries
/r/<name>.json           one item, file contents included
/r/themes/index.json     available themes
/r/themes/<name>.json    a theme's Tailwind v4 CSS
/r/tokens/<name>.json    the same theme as W3C DTCG tokens
/r/icons/index.json      supported icon sets (package, styles, license)`}
      />
    </article>
  )
}
