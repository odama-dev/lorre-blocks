"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { registry } from "@lorre-blocks/registry/registry"
import { cn } from "@lorre-blocks/registry/lib/utils"

const GETTING_STARTED = [
  { title: "Introduction", href: "/docs" },
  { title: "Theming", href: "/docs/theming" },
  { title: "CLI reference", href: "/docs/cli" },
]

const componentLinks = registry
  .filter((item) => item.type === "registry:ui")
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((item) => ({
    title: item.name,
    href: `/docs/components/${item.name}`,
    isNew: item.source === "lorre",
  }))

const blockLinks = registry
  .filter((item) => item.type === "registry:block")
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((item) => ({
    title: item.name,
    href: `/docs/blocks/${item.name}`,
    isNew: item.source === "lorre",
  }))

const motionLinks = registry
  .filter((item) => item.type === "registry:motion")
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((item) => ({
    title: item.name,
    href: `/docs/motion/${item.name}`,
    isNew: item.source === "lorre",
  }))

function SidebarLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        active
          ? "bg-accent font-medium text-accent-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </Link>
  )
}

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <nav className="space-y-6">
      <div>
        <h4 className="mb-2 px-2 text-sm font-semibold">Getting started</h4>
        {GETTING_STARTED.map((link) => (
          <SidebarLink
            key={link.href}
            href={link.href}
            active={pathname === link.href}
          >
            {link.title}
          </SidebarLink>
        ))}
      </div>
      <div>
        <h4 className="mb-2 px-2 text-sm font-semibold">Blocks</h4>
        {blockLinks.map((link) => (
          <SidebarLink
            key={link.href}
            href={link.href}
            active={pathname === link.href}
          >
            {link.title}
            {link.isNew && (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                lorre
              </span>
            )}
          </SidebarLink>
        ))}
      </div>
      <div>
        <h4 className="mb-2 px-2 text-sm font-semibold">Motion</h4>
        {motionLinks.map((link) => (
          <SidebarLink
            key={link.href}
            href={link.href}
            active={pathname === link.href}
          >
            {link.title}
            {link.isNew && (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                lorre
              </span>
            )}
          </SidebarLink>
        ))}
      </div>
      <div>
        <h4 className="mb-2 px-2 text-sm font-semibold">Components</h4>
        {componentLinks.map((link) => (
          <SidebarLink
            key={link.href}
            href={link.href}
            active={pathname === link.href}
          >
            {link.title}
            {link.isNew && (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                lorre
              </span>
            )}
          </SidebarLink>
        ))}
      </div>
    </nav>
  )
}
