import type { Metadata } from "next"

import { IconBrowser } from "@www/components/icons/icon-browser"
import { IconCategoryNav } from "@www/components/icons/icon-category-nav"
import { IconsProvider } from "@www/components/icons/icons-context"
import { ResourcesShell } from "@www/components/resources-shell"

export const metadata: Metadata = {
  title: "Icons — Lorre Blocks",
  description:
    "Browse the supported icon sets — Lucide, Radix Icons, Phosphor, Heroicons — filter by style and category, tune size, stroke and color, then copy as SVG or JSX or download. Built for designers and coders alike.",
}

export default function IconsPage() {
  return (
    <IconsProvider>
      <ResourcesShell
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Resources" },
          { label: "Icons" },
        ]}
        sidebarExtra={<IconCategoryNav />}
      >
        <div className="mt-4">
          <h1 className="text-3xl font-bold tracking-tight">Icons</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Four permissively-licensed sets, one design system. Filter by style
            and category, dial in size, stroke and color, then grab an icon as
            SVG for Figma or as JSX for code — pick a set and the Theme Studio,
            CLI and agents all honor it via{" "}
            <code className="font-mono text-sm">lorre.theme.json</code>.
          </p>
        </div>
        <div className="mt-6">
          <IconBrowser />
        </div>
      </ResourcesShell>
    </IconsProvider>
  )
}
