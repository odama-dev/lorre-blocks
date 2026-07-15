import type { Metadata } from "next"

import { ResourceStub } from "@www/components/resource-stub"
import { ResourcesShell } from "@www/components/resources-shell"

export const metadata: Metadata = {
  title: "Logos — Lorre Blocks",
  description:
    "Brand and technology logos as ready-to-use SVG and React components — coming soon to the Lorre Blocks resources hub.",
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
      <ResourceStub
        title="Logos"
        tagline="Brand and technology logos as clean SVGs and React components, colorable through the same customizer, copyable for design tools or code."
        planned={[
          "Framework & tooling marks (Next.js, React, Vite…)",
          "Monochrome + full-color variants",
          "Copy as SVG or JSX, download",
          "currentColor-aware for theming",
          "Search and category filters",
          "One-click adopt in the Theme Studio",
        ]}
      />
    </ResourcesShell>
  )
}
