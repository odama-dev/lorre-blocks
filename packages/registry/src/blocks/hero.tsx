import * as React from "react"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"

export interface HeroAction {
  label: string
  href: string
  /** Defaults to "default" for the first action and "outline" for the rest. */
  variant?: VariantProps<typeof buttonVariants>["variant"]
}

export interface HeroProps extends React.ComponentProps<"section"> {
  /** Small badge line above the title, e.g. an announcement. */
  eyebrow?: string
  title: string
  description?: string
  actions?: HeroAction[]
  align?: "center" | "start"
}

/**
 * Landing page hero: eyebrow badge, headline, supporting copy, action buttons.
 * Content is passed as data so the block works in server components and can be
 * configured by agents; actions render as plain links.
 */
function Hero({
  eyebrow,
  title,
  description,
  actions = [],
  align = "center",
  className,
  ...props
}: HeroProps) {
  return (
    <section
      data-slot="hero"
      className={cn("w-full py-24 md:py-32", className)}
      {...props}
    >
      <div
        className={cn(
          "mx-auto flex max-w-4xl flex-col gap-6 px-6",
          align === "center" ? "items-center text-center" : "items-start"
        )}
      >
        {eyebrow && (
          <Badge data-slot="hero-eyebrow" variant="secondary">
            {eyebrow}
          </Badge>
        )}
        <h1
          data-slot="hero-title"
          className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
        >
          {title}
        </h1>
        {description && (
          <p
            data-slot="hero-description"
            className="max-w-2xl text-lg text-muted-foreground"
          >
            {description}
          </p>
        )}
        {actions.length > 0 && (
          <div
            data-slot="hero-actions"
            className={cn(
              "mt-2 flex flex-wrap gap-3",
              align === "center" && "justify-center"
            )}
          >
            {actions.map((action, index) => (
              <a
                key={action.href + action.label}
                href={action.href}
                className={buttonVariants({
                  variant: action.variant ?? (index === 0 ? "default" : "outline"),
                  size: "lg",
                })}
              >
                {action.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export { Hero }
