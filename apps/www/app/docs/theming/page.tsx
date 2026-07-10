import type { Metadata } from "next"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lorre-blocks/registry/ui/card"
import { CommandSnippet } from "@www/components/code-block"

export const metadata: Metadata = { title: "Theming" }

const THEMES = [
  {
    name: "basic",
    description:
      "The root theme: blue accent, balanced radii and shadows, 200ms motion. Every other theme extends it.",
  },
  {
    name: "dreamy",
    description:
      "Violet accent, large radii, plush shadows, slower motion. For expressive marketing and creative work.",
  },
  {
    name: "utilitarian",
    description:
      "Monochrome accent, sharp radii, minimal shadows, fast motion. For dense professional dashboards.",
  },
]

export default function ThemingPage() {
  return (
    <article className="max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">Theming</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        A theme is data: five color seeds plus radius, shadow, motion and
        typography values. Everything else — 12-step OKLCH scales, semantic
        aliases, dark mode — is generated.
      </p>

      <div className="mt-8 grid gap-4">
        {THEMES.map((theme) => (
          <Card key={theme.name}>
            <CardHeader>
              <CardTitle className="font-mono text-base">
                {theme.name}
              </CardTitle>
              <CardDescription>{theme.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-semibold">How it works</h2>
      <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-muted-foreground">
        <li>
          Each color axis (neutral, accent, danger, success, warning) grows
          from one seed into a Radix-style 12-step OKLCH scale — light and dark.
        </li>
        <li>
          Components only reference semantic tokens (
          <code className="font-mono">bg-primary</code>,{" "}
          <code className="font-mono">text-muted-foreground</code>,{" "}
          <code className="font-mono">ring-ring</code>), which map onto scale
          steps. That indirection is what makes themes swappable.
        </li>
        <li>
          Tokens ship as Tailwind v4 CSS for your app and as W3C DTCG JSON (
          <code className="font-mono">/r/tokens/&lt;name&gt;.json</code>) for
          design tooling and agents.
        </li>
        <li>
          Try it now: the palette icon in this site&apos;s header applies a
          theme the same way the CLI does — swap tokens, touch no components.
        </li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold">Commands</h2>
      <div className="mt-4 space-y-3">
        <CommandSnippet command="npx lorre-blocks theme list" />
        <CommandSnippet command="npx lorre-blocks theme apply utilitarian" />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        <code className="font-mono">theme apply</code> replaces the token block
        between the <code className="font-mono">lorre-blocks theme</code>{" "}
        markers in your global CSS, in place. The active theme is recorded in{" "}
        <code className="font-mono">components.json</code>.
      </p>
    </article>
  )
}
