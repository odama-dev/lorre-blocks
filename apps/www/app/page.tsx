import Link from "next/link"
import { Button } from "@lorre-blocks/registry/ui/button"

export default function HomePage() {
  return (
    <main className="container mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">lorre-blocks</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        A shadcn-style component library. Copy component source straight into your
        project with the CLI &mdash; you own and edit every line.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button asChild>
          <Link href="/docs/components/button">Button</Link>
        </Button>
        <Button asChild>
          <Link href="/docs/components/input">Input</Link>
        </Button>
        <Button variant="outline" asChild>
          <a
            href="https://www.npmjs.com/package/lorre-blocks"
            target="_blank"
            rel="noreferrer"
          >
            npm
          </a>
        </Button>
      </div>

      <div className="mt-12 rounded-lg border bg-card p-6">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Get started
        </h2>
        <pre className="mt-3 overflow-x-auto rounded-md bg-muted p-4 text-sm">
          <code>{`npx lorre-blocks init\nnpx lorre-blocks add button`}</code>
        </pre>
      </div>
    </main>
  )
}
