import Link from "next/link"
import { ArrowRight, Bot, Palette, SwatchBook, Terminal } from "lucide-react"

import { registry } from "@lorre-blocks/registry/registry"
import { Badge } from "@lorre-blocks/registry/ui/badge"
import { Button } from "@lorre-blocks/registry/ui/button"
import { CommandSnippet } from "@www/components/code-block"
import { Showcase } from "@www/components/showcase"

const FEATURES = [
  {
    icon: SwatchBook,
    title: "12-step OKLCH scales",
    body: "Five color axes generated from seeds into Radix-style scales, light and dark, mapped to semantic tokens components actually use.",
  },
  {
    icon: Palette,
    title: "Themes are data",
    body: "basic, dreamy and utilitarian are token values, not component forks. Swapping a project's whole look is one CLI command.",
  },
  {
    icon: Terminal,
    title: "You own the code",
    body: "shadcn-style distribution: the CLI copies component source into your project. Edit every line; no runtime dependency on us.",
  },
  {
    icon: Bot,
    title: "Agent-first",
    body: "Every CLI command takes --json and never prompts. Agents search the registry, read metadata and assemble projects unattended.",
  },
]

export default function HomePage() {
  const componentCount = registry.filter(
    (item) => item.type === "registry:ui"
  ).length

  return (
    <main>
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-24 text-center">
        <Badge variant="secondary" className="mb-6">
          {componentCount} components · 3 themes · CLI on npm
        </Badge>
        <h1 className="mx-auto max-w-3xl text-balance text-5xl font-bold tracking-tight">
          Design tokens and components for every Lorre project
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
          A token + component registry in the spirit of Radix, distributed the
          shadcn way. Pick a theme, add components, own the source — from
          enterprise dashboards to award-bait creative sites.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/docs">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/docs/components/accordion">Browse components</Link>
          </Button>
        </div>
        <CommandSnippet
          command="npx lorre-blocks init --theme dreamy"
          className="mx-auto mt-8 max-w-md"
        />
        <p className="mt-4 text-xs text-muted-foreground">
          Try the palette icon in the header — the page below re-themes live.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <Showcase />
      </section>

      <section className="border-t bg-muted/40">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div key={feature.title}>
              <feature.icon className="h-5 w-5 text-primary" />
              <h2 className="mt-3 font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
          <p>Lorre Blocks — internal design system, alpha.</p>
          <div className="flex gap-4">
            <Link href="/docs" className="hover:text-foreground">
              Docs
            </Link>
            <a
              href="https://www.npmjs.com/package/lorre-blocks"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              npm
            </a>
            <a
              href="https://github.com/odama-dev/lorre-blocks"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
