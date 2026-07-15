import type { Metadata } from "next"

import { LogoBrowser } from "@www/components/logos/logo-browser"
import { ResourcesShell } from "@www/components/resources-shell"

export const metadata: Metadata = {
  title: "Logos — Lorre Blocks",
  description:
    "Brand and technology logos from simple-icons (CC0) — preview on light or dark, in brand color or monochrome, then copy as SVG or inline JSX or download.",
}

export default function LogosPage() {
  return (
    <ResourcesShell
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Resources" },
        { label: "Logos" },
      ]}
    >
      <div className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight">Logos</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Brand and technology logos from{" "}
          <a
            href="https://simpleicons.org"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            simple-icons
          </a>{" "}
          (CC0) — preview on a light or dark surface, in brand color or
          monochrome, then copy as SVG or inline JSX or download. Trademarks
          belong to their respective owners.
        </p>
      </div>
      <div className="mt-6">
        <LogoBrowser />
      </div>
    </ResourcesShell>
  )
}
