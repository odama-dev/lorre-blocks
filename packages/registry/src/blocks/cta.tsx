import * as React from "react"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export interface CtaAction {
  label: string
  href: string
  variant?: VariantProps<typeof buttonVariants>["variant"]
}

export interface CtaProps extends React.ComponentProps<"section"> {
  title: string
  description?: string
  actions?: CtaAction[]
  /**
   * "accent" fills the panel with the primary color; "outline" keeps it on
   * the card surface with a border. Both resolve per theme via semantic tokens.
   */
  variant?: "accent" | "outline"
}

/**
 * Call-to-action banner: a rounded panel with headline, supporting copy and
 * action buttons. Use near the end of a page to convert.
 */
function Cta({
  title,
  description,
  actions = [],
  variant = "accent",
  className,
  ...props
}: CtaProps) {
  const accent = variant === "accent"
  return (
    <section
      data-slot="cta"
      className={cn("w-full py-16 md:py-24", className)}
      {...props}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div
          data-slot="cta-panel"
          className={cn(
            "flex flex-col items-center gap-6 rounded-2xl px-6 py-16 text-center md:px-16",
            accent
              ? "bg-primary text-primary-foreground"
              : "border bg-card text-card-foreground shadow-sm"
          )}
        >
          <h2
            data-slot="cta-title"
            className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl"
          >
            {title}
          </h2>
          {description && (
            <p
              data-slot="cta-description"
              className={cn(
                "max-w-2xl text-lg",
                accent ? "text-primary-foreground/80" : "text-muted-foreground"
              )}
            >
              {description}
            </p>
          )}
          {actions.length > 0 && (
            <div data-slot="cta-actions" className="mt-2 flex flex-wrap justify-center gap-3">
              {actions.map((action, index) => (
                <a
                  key={action.href + action.label}
                  href={action.href}
                  className={buttonVariants({
                    variant:
                      action.variant ??
                      (index === 0
                        ? accent
                          ? "secondary"
                          : "default"
                        : accent
                          ? "ghost"
                          : "outline"),
                    size: "lg",
                  })}
                >
                  {action.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export { Cta }
