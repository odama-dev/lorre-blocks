"use client"

import * as React from "react"
import { Menu01 as Menu, XClose as X } from "@untitledui/icons"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

export interface NavbarLink {
  label: string
  href: string
}

export interface NavbarAction {
  label: string
  href: string
  /** Defaults to "ghost" for all but the last action, which gets "default". */
  variant?: VariantProps<typeof buttonVariants>["variant"]
}

export interface NavbarProps extends React.ComponentProps<"header"> {
  /** Brand name shown on the left; links to `brandHref`. */
  brand: string
  brandHref?: string
  links?: NavbarLink[]
  /** Right-side buttons, e.g. Sign in / Get started. */
  actions?: NavbarAction[]
  /** Stick the bar to the top of the viewport with a blur backdrop. */
  sticky?: boolean
}

/**
 * Site header / navigation bar: brand, centered links, action buttons, and a
 * mobile menu behind a hamburger toggle. The only client-interactive block so
 * far — the disclosure state lives here, everything else is data props.
 */
function Navbar({
  brand,
  brandHref = "/",
  links = [],
  actions = [],
  sticky = true,
  className,
  ...props
}: NavbarProps) {
  const [open, setOpen] = React.useState(false)

  const actionVariant = (action: NavbarAction, index: number) =>
    action.variant ?? (index === actions.length - 1 ? "default" : "ghost")

  return (
    <header
      data-slot="navbar"
      className={cn(
        "w-full border-b bg-background/80 backdrop-blur",
        sticky && "sticky top-0 z-40",
        className
      )}
      {...props}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
        <a
          href={brandHref}
          data-slot="navbar-brand"
          className="text-base font-semibold text-foreground"
        >
          {brand}
        </a>
        {links.length > 0 && (
          <div data-slot="navbar-links" className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <a
                key={link.href + link.label}
                href={link.href}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
        <div data-slot="navbar-actions" className="ml-auto hidden items-center gap-2 md:flex">
          {actions.map((action, index) => (
            <a
              key={action.href + action.label}
              href={action.href}
              className={buttonVariants({
                variant: actionVariant(action, index),
                size: "sm",
              })}
            >
              {action.label}
            </a>
          ))}
        </div>
        <Button
          data-slot="navbar-toggle"
          variant="ghost"
          size="icon"
          className="ml-auto md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </nav>
      {open && (
        <div
          data-slot="navbar-mobile"
          className="flex flex-col gap-1 border-t px-4 py-4 md:hidden"
        >
          {links.map((link) => (
            <a
              key={link.href + link.label}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          {actions.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              {actions.map((action, index) => (
                <a
                  key={action.href + action.label}
                  href={action.href}
                  className={buttonVariants({
                    variant: actionVariant(action, index),
                  })}
                  onClick={() => setOpen(false)}
                >
                  {action.label}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  )
}

export { Navbar }
