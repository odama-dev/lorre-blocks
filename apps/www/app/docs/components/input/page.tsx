import Link from "next/link"
import { Input } from "@lorre-blocks/registry/ui/input"
import { Button } from "@lorre-blocks/registry/ui/button"

export default function InputDocsPage() {
  return (
    <main className="container mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Home
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">Input</h1>
      <p className="mt-2 text-muted-foreground">A styled text input field.</p>

      <div className="mt-6 rounded-md bg-muted p-4 text-sm">
        <code>npx lorre-blocks add input</code>
      </div>

      <section className="mt-10 space-y-8">
        <Preview title="Default">
          <Input placeholder="Email" className="max-w-xs" />
        </Preview>

        <Preview title="Disabled">
          <Input placeholder="Disabled" disabled className="max-w-xs" />
        </Preview>

        <Preview title="With a button">
          <div className="flex w-full max-w-sm items-center gap-2">
            <Input type="email" placeholder="Email" />
            <Button type="submit">Subscribe</Button>
          </div>
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
