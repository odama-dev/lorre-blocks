"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Blocks,
  CircleUser,
  LoaderCircle,
  Palette,
  Shapes,
  Sparkles,
  SquareDashedBottomCode,
  Terminal,
} from "lucide-react"

import { cn } from "@lorre-blocks/registry/lib/utils"

type Item = {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  soon?: boolean
  external?: boolean
}

const SECTIONS: { heading: string; items: Item[] }[] = [
  {
    heading: "Documentation",
    items: [
      { title: "Introduction", href: "/docs", icon: BookOpen },
      { title: "Theming", href: "/docs/theming", icon: Palette },
      { title: "CLI reference", href: "/docs/cli", icon: Terminal },
    ],
  },
  {
    heading: "Resources",
    items: [
      { title: "Icons", href: "/icons", icon: Shapes },
      { title: "Loaders", href: "/loaders", icon: LoaderCircle },
      { title: "Logos", href: "/logos", icon: Sparkles },
      { title: "Avatars", href: "/avatars", icon: CircleUser },
    ],
  },
  {
    heading: "Build",
    items: [
      {
        title: "Components",
        href: "/docs/components/accordion",
        icon: SquareDashedBottomCode,
      },
      { title: "Theme Studio", href: "/themes", icon: Blocks },
    ],
  },
]

export function ResourcesSidebar() {
  const pathname = usePathname()

  return (
    <nav className="space-y-6">
      {SECTIONS.map((section) => (
        <div key={section.heading}>
          <h4 className="mb-2 px-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {section.heading}
          </h4>
          {section.items.map((item) => {
            const active =
              item.href === "/icons"
                ? pathname === "/icons"
                : pathname === item.href
            return (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 border border-dashed border-transparent px-2 py-1.5 text-sm transition-colors",
                  active
                    ? "border-border bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:border-border/60 hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.title}
                {item.soon && (
                  <span className="ml-auto border border-dashed border-border px-1 py-0.5 font-mono text-[9px] uppercase leading-none text-muted-foreground">
                    soon
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
