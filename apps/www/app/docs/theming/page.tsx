import type { Metadata } from "next"
import Link from "next/link"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lorre-blocks/registry/ui/card"
import { CodeBlock, CommandSnippet } from "@www/components/code-block"

export const metadata: Metadata = { title: "Theming" }

// Exported for the docs-contract test: this example must always validate
// against the real themeDefinitionSchema.
export const THEME_JSON_EXAMPLE = `{
  "name": "acme",
  "description": "Acme brand theme",
  "extends": "basic",
  "colors": {
    "accent":    { "hue": 293, "chroma": 0.25, "lightness": 0.54 },
    "secondary": { "hue": 70,  "chroma": 0.16, "lightness": 0.77 }
  },
  "typography": {
    "fontSans": ["Geist", "ui-sans-serif", "system-ui", "sans-serif"],
    "typeScale": { "base": "1rem", "ratio": 1.2 }
  },
  "radius": { "base": "1rem", "sm": "0.5rem", "md": "0.75rem",
              "lg": "1rem", "xl": "1.5rem", "2xl": "2rem" },
  "spacing": { "scaling": 1.05 },
  "components": { "button": { "radius": "9999px" } },
  "icons": { "set": "phosphor", "style": "duotone" }
}`

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

      <h2 className="mt-10 text-xl font-semibold">Custom themes</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        Presets are the starting point, not the ceiling. A custom theme is a{" "}
        <code className="font-mono">lorre.theme.json</code> file — the contract
        shared by the{" "}
        <Link href="/themes" className="underline underline-offset-4">
          Theme Studio
        </Link>
        , the CLI, and agents. It extends a preset and overrides only what you
        care about:
      </p>
      <CodeBlock lang="json" className="mt-4" code={THEME_JSON_EXAMPLE} />
      <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-muted-foreground">
        <li>
          <code className="font-mono">colors.*</code> — OKLCH seeds (hue 0–360,
          chroma, lightness); each grows into the full 12-step scale, light and
          dark. <code className="font-mono">secondary</code> is an optional
          sixth scale; when present, the{" "}
          <code className="font-mono">bg-secondary</code> semantics point at it
          automatically.
        </li>
        <li>
          <code className="font-mono">typography.typeScale</code> — modular
          headings; emitted as fluid <code className="font-mono">clamp()</code>{" "}
          tokens, so <code className="font-mono">text-h1</code>…
          <code className="font-mono">text-h6</code> are responsive with zero
          media queries.
        </li>
        <li>
          <code className="font-mono">spacing.scaling</code> — 0.9–1.1 density
          factor; every spacing utility follows.
        </li>
        <li>
          <code className="font-mono">components.*</code> — per-component knobs
          (button, input, card, panel, badge, tabs, control, tooltip): radius,
          padding, size.
        </li>
        <li>
          <code className="font-mono">icons</code> — the set your app uses; see{" "}
          <Link href="/icons" className="underline underline-offset-4">
            Icons
          </Link>
          .
        </li>
      </ul>

      <h3 className="mt-8 text-lg font-semibold">Two front doors, one engine</h3>
      <p className="mt-3 text-sm text-muted-foreground">
        Humans tailor visually in the{" "}
        <Link href="/themes" className="underline underline-offset-4">
          Theme Studio
        </Link>{" "}
        and copy the CSS or the JSON. Agents write the JSON directly and run one
        command — the same engine generates the CSS locally, so both paths
        produce byte-identical output:
      </p>
      <div className="mt-4 space-y-3">
        <CommandSnippet command="npx lorre-blocks theme create --from lorre.theme.json" />
        <CommandSnippet command='npx lorre-blocks theme create --accent "#7C3AED" --radius xl --scaling 105' />
        <CommandSnippet command="npx lorre-blocks theme show --json" />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Edit <code className="font-mono">lorre.theme.json</code> later and re-run{" "}
        <code className="font-mono">theme apply</code> (no argument) to
        regenerate. <code className="font-mono">theme show</code> prints the
        resolved design system — scales, semantics, type scale, component
        tokens — so nothing has to parse CSS.
      </p>
    </article>
  )
}
