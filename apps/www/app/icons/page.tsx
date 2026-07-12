import type { Metadata } from "next"

import { IconBrowser } from "@www/components/icons/icon-browser"

export const metadata: Metadata = {
  title: "Icons — Lorre Blocks",
  description:
    "Browse the supported icon sets — Lucide, Radix Icons, Phosphor, Heroicons — with per-style variants, copy as SVG or JSX, and one click to adopt a set in your design system.",
}

export default function IconsPage() {
  return (
    <main>
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <h1 className="text-3xl font-bold tracking-tight">Icons</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Four permissively-licensed sets, one design system. Hover an icon to
            copy its SVG or JSX; pick a set and the Theme Studio, CLI and agents
            all honor it via{" "}
            <code className="font-mono text-sm">lorre.theme.json</code>.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <IconBrowser />
      </div>
    </main>
  )
}
