import * as React from "react"

/**
 * "Coming soon" placeholder for Resources hub pages that aren't built yet
 * (Logos, Avatars). Keeps the sidebar + breadcrumb navigable while signalling
 * intent, styled to match the blueprint frames.
 */
export function ResourceStub({
  title,
  tagline,
  planned,
}: {
  title: string
  tagline: string
  planned: string[]
}) {
  return (
    <>
      <div className="mt-4 flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <span className="border border-dashed border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          coming soon
        </span>
      </div>
      <p className="mt-2 max-w-2xl text-muted-foreground">{tagline}</p>
      <div className="mt-8 border border-dashed bg-muted/20 p-8">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Planned
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {planned.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 border border-dashed border-border/70 bg-card px-3 py-2 text-sm"
            >
              <span className="h-1.5 w-1.5 shrink-0 bg-primary" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
