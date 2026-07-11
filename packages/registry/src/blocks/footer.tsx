import * as React from "react"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

export interface FooterLink {
  label: string
  href: string
}

export interface FooterGroup {
  title: string
  links: FooterLink[]
}

export interface FooterProps extends React.ComponentProps<"footer"> {
  /** Brand name shown top-left; links to `brandHref` when provided. */
  brand: string
  brandHref?: string
  description?: string
  groups?: FooterGroup[]
  /** Bottom line, e.g. "© 2026 Lorre. All rights reserved." */
  copyright?: string
  /** Small links on the bottom line, e.g. Privacy / Terms. */
  legalLinks?: FooterLink[]
}

/**
 * Site footer: brand + description on the left, link groups on the right,
 * and a bottom line with copyright and legal links.
 */
function Footer({
  brand,
  brandHref = "/",
  description,
  groups = [],
  copyright,
  legalLinks = [],
  className,
  ...props
}: FooterProps) {
  return (
    <footer
      data-slot="footer"
      className={cn("w-full border-t bg-background", className)}
      {...props}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div data-slot="footer-brand" className="flex max-w-xs flex-col gap-3">
            <a href={brandHref} className="text-lg font-semibold text-foreground">
              {brand}
            </a>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {groups.length > 0 && (
            <div
              data-slot="footer-groups"
              className="grid grid-cols-2 gap-8 sm:grid-cols-3"
            >
              {groups.map((group) => (
                <div
                  key={group.title}
                  data-slot="footer-group"
                  className="flex flex-col gap-3"
                >
                  <h3 className="text-sm font-semibold text-foreground">
                    {group.title}
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {group.links.map((link) => (
                      <li key={link.href + link.label}>
                        <a
                          href={link.href}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
        {(copyright || legalLinks.length > 0) && (
          <div className="flex flex-col gap-4">
            <Separator />
            <div
              data-slot="footer-bottom"
              className="flex flex-col items-center justify-between gap-3 sm:flex-row"
            >
              {copyright && (
                <p className="text-sm text-muted-foreground">{copyright}</p>
              )}
              {legalLinks.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {legalLinks.map((link) => (
                    <a
                      key={link.href + link.label}
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </footer>
  )
}

export { Footer }
