import type { Metadata } from "next"
import Link from "next/link"

import { CommandSnippet } from "@www/components/code-block"

export const metadata: Metadata = { title: "Introduction" }

export default function DocsPage() {
  return (
    <article className="max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">Introduction</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Lorre Blocks is a design token + component registry: Radix-style
        token/theme architecture, shadcn-style distribution. The CLI copies
        component source into your project — you own and edit every line.
      </p>

      <h2 className="mt-10 text-xl font-semibold">Quickstart</h2>
      <ol className="mt-4 space-y-6 text-sm">
        <li>
          <p className="font-medium">
            1. Initialize your project (Tailwind v4 required)
          </p>
          <p className="mb-2 mt-1 text-muted-foreground">
            Writes <code className="font-mono">components.json</code>, installs
            base dependencies, adds the <code className="font-mono">cn()</code>{" "}
            helper and injects your theme&apos;s tokens into the global CSS.
          </p>
          <CommandSnippet command="npx lorre-blocks init --theme basic" />
        </li>
        <li>
          <p className="font-medium">2. Add components</p>
          <p className="mb-2 mt-1 text-muted-foreground">
            Dependencies between components resolve automatically —{" "}
            <code className="font-mono">date-picker</code> pulls in calendar,
            popover and button on its own.
          </p>
          <CommandSnippet command="npx lorre-blocks add button card date-picker" />
        </li>
        <li>
          <p className="font-medium">3. Change your mind about the look</p>
          <p className="mb-2 mt-1 text-muted-foreground">
            Themes are token values, not component forks. This swaps the whole
            look and touches zero component files.
          </p>
          <CommandSnippet command="npx lorre-blocks theme apply dreamy" />
        </li>
      </ol>

      <h2 className="mt-10 text-xl font-semibold">Where next</h2>
      <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-muted-foreground">
        <li>
          <Link href="/docs/theming" className="text-primary hover:underline">
            Theming
          </Link>{" "}
          — the three themes and the OKLCH token architecture behind them.
        </li>
        <li>
          <Link href="/docs/cli" className="text-primary hover:underline">
            CLI reference
          </Link>{" "}
          — every command, including the <code className="font-mono">--json</code>{" "}
          contract agents build on.
        </li>
        <li>
          <Link
            href="/docs/components/accordion"
            className="text-primary hover:underline"
          >
            Components
          </Link>{" "}
          — live previews, source and install snippets for every registry item.
        </li>
      </ul>
    </article>
  )
}
