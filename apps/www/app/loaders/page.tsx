import type { Metadata } from "next"

import { LoaderBrowser } from "@www/components/loaders/loader-browser"
import { ResourcesShell } from "@www/components/resources-shell"

export const metadata: Metadata = {
  title: "Loaders — Lorre Blocks",
  description:
    "Animated loaders and spinners from ldrs (uiball) — tune size, speed, stroke and color, then copy as a React component or web-component tag. Theme-aware via currentColor.",
}

export default function LoadersPage() {
  return (
    <ResourcesShell
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Resources" },
        { label: "Loaders" },
      ]}
    >
      <div className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight">Loaders</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Animated loaders and spinners from{" "}
          <a
            href="https://uiball.com/ldrs/"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            ldrs
          </a>{" "}
          — tune size, speed, stroke and color, then copy as a React component or
          a web-component tag. They inherit{" "}
          <code className="font-mono text-sm">currentColor</code>, so they follow
          the theme out of the box.
        </p>
      </div>
      <div className="mt-6">
        <LoaderBrowser />
      </div>
    </ResourcesShell>
  )
}
