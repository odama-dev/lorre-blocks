import Link from "next/link"
import { Button } from "@lorre-blocks/registry/ui/button"

export default function ButtonDocsPage() {
  return (
    <main className="container mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Home
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">Button</h1>
      <p className="mt-2 text-muted-foreground">
        Displays a button or a component that looks like a button.
      </p>

      <div className="mt-6 rounded-md bg-muted p-4 text-sm">
        <code>npx lorre-blocks add button</code>
      </div>

      <section className="mt-10 space-y-8">
        <Preview title="Variants">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </Preview>

        <Preview title="Sizes">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </Preview>

        <Preview title="Disabled">
          <Button disabled>Disabled</Button>
        </Preview>
      </section>
    </main>
  )
}

function Preview({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground">{title}</h2>
      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border p-6">
        {children}
      </div>
    </div>
  )
}
