import type { Metadata } from "next"

import { ResourceStub } from "@www/components/resource-stub"
import { ResourcesShell } from "@www/components/resources-shell"

export const metadata: Metadata = {
  title: "Avatars — Lorre Blocks",
  description:
    "Generated avatars and placeholder identities on Lorre tokens — coming soon to the resources hub.",
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
      <ResourceStub
        title="Avatars"
        tagline="Deterministic generated avatars and placeholder identities built on Lorre tokens — for mockups in Figma and seeded UIs in code."
        planned={[
          "Seeded geometric & gradient avatars",
          "Initials fallbacks on theme colors",
          "Configurable size, radius and palette",
          "Copy as SVG or JSX, download PNG",
          "Batch generate a set",
          "Pairs with the Avatar component",
        ]}
      />
    </ResourcesShell>
  )
}
