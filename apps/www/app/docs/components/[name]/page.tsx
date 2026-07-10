import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@lorre-blocks/registry/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@lorre-blocks/registry/ui/tabs"
import { CodeBlock, CommandSnippet } from "@www/components/code-block"
import { demos } from "@www/components/demos"
import { getItem, readItemSource, uiItems } from "@www/lib/registry"

export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
  return uiItems.map((item) => ({ name: item.name }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>
}): Promise<Metadata> {
  const { name } = await params
  const item = getItem(name)
  return { title: name, description: item?.description }
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  const item = getItem(name)
  if (!item || item.type !== "registry:ui") notFound()

  const source = await readItemSource(item)
  const Demo = demos[item.name]

  return (
    <article className="max-w-3xl">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-2 text-3xl font-bold tracking-tight">{item.name}</h1>
        <Badge variant="outline" className="font-mono">
          {item.source}
        </Badge>
        {item.license && (
          <Badge variant="secondary" className="font-mono">
            {item.license}
          </Badge>
        )}
      </div>
      <p className="mt-3 text-lg text-muted-foreground">{item.description}</p>

      <CommandSnippet
        command={`npx lorre-blocks add ${item.name}`}
        className="mt-6"
      />

      <Tabs defaultValue="preview" className="mt-8">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <TabsContent value="preview">
          <div className="mt-2 flex min-h-[280px] items-center justify-center rounded-lg border p-8">
            {Demo ? (
              <Demo />
            ) : (
              <p className="text-sm text-muted-foreground">
                No preview yet — see the Code tab.
              </p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="code">
          <CodeBlock code={source} className="mt-2 max-h-[480px] overflow-y-auto" />
        </TabsContent>
      </Tabs>

      {(item.dependencies?.length || item.registryDependencies?.length) && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Dependencies</h2>
          {item.registryDependencies && item.registryDependencies.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Registry (installed automatically)
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.registryDependencies.map((dep) => (
                  <Link
                    key={dep}
                    href={
                      dep === "utils" ? "/docs" : `/docs/components/${dep}`
                    }
                  >
                    <Badge variant="secondary" className="font-mono">
                      {dep}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {item.dependencies && item.dependencies.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground">npm</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.dependencies.map((dep) => (
                  <a
                    key={dep}
                    href={`https://www.npmjs.com/package/${dep}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Badge variant="outline" className="font-mono">
                      {dep}
                    </Badge>
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {item.tags && item.tags.length > 0 && (
        <p className="mt-10 text-xs text-muted-foreground">
          Tags: {item.tags.join(" · ")}
        </p>
      )}
    </article>
  )
}
