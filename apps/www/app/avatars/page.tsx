import type { Metadata } from "next"

import { AvatarBrowser } from "@www/components/avatars/avatar-browser"
import { ResourcesShell } from "@www/components/resources-shell"

export const metadata: Metadata = {
  title: "Avatars — Lorre Blocks",
  description:
    "Generated placeholder avatars — illustrated people portraits, gradient, geometric, rings and initials — with neutral or transparent backgrounds, or upload your own. Copy as SVG or PNG, or download.",
}

export default function AvatarsPage() {
  return (
    <ResourcesShell
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Resources" },
        { label: "Avatars" },
      ]}
    >
      <div className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight">Avatars</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Deterministic placeholder avatars for mockups and seeded UIs — pick a
          style, background and shape, then copy each as SVG or PNG or download
          it. Or upload your own image and frame it the same way.
        </p>
      </div>
      <div className="mt-6">
        <AvatarBrowser />
      </div>
    </ResourcesShell>
  )
}
