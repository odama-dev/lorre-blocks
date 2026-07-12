import type { Metadata } from "next"

import { ThemeStudio } from "@www/components/studio/theme-studio"

export const metadata: Metadata = {
  title: "Theme Studio — Lorre Blocks",
  description:
    "Tailor a complete design system — colors, typography, radius, density, component tokens, icons — and export it as CSS, lorre.theme.json, or a CLI command.",
}

export default function ThemesPage() {
  return (
    <main>
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <h1 className="text-3xl font-bold tracking-tight">Theme Studio</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Tune the tokens, watch every component follow. Copy the result as
            CSS or <code className="font-mono text-sm">lorre.theme.json</code> —
            or hand the JSON to an agent and let{" "}
            <code className="font-mono text-sm">lorre-blocks theme create</code>{" "}
            inject the identical design system.
          </p>
        </div>
      </div>
      <ThemeStudio />
    </main>
  )
}
