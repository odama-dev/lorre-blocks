import * as React from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@lorre-blocks/registry/ui/breadcrumb"
import { ResourcesSidebar } from "@www/components/resources-sidebar"

export type Crumb = { label: string; href?: string }

/**
 * Layout for the Resources hub (icons, logos, avatars): the framed dashed
 * column with a docs-style sidebar on the left and a breadcrumb over the
 * content. Mirrors the /docs shell so the two feel like one system.
 */
export function ResourcesShell({
  crumbs,
  sidebarExtra,
  children,
}: {
  crumbs: Crumb[]
  /** Optional page-specific sidebar content, rendered below the nav. */
  sidebarExtra?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex max-w-7xl border-x border-dashed">
      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-dashed px-4 py-8 md:block">
        <ResourcesSidebar />
        {sidebarExtra}
      </aside>
      <div className="min-w-0 flex-1 px-6 py-8 md:px-8">
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb, index) => {
              const last = index === crumbs.length - 1
              return (
                <React.Fragment key={crumb.label}>
                  <BreadcrumbItem>
                    {last || !crumb.href ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href}>
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!last && <BreadcrumbSeparator />}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
        {children}
      </div>
    </div>
  )
}
