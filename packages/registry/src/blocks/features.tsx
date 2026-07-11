import * as React from "react"

import { cn } from "@/lib/utils"

export interface FeatureItem {
  title: string
  description: string
  /** Optional leading visual, e.g. a lucide icon element. */
  icon?: React.ReactNode
}

export interface FeaturesProps extends React.ComponentProps<"section"> {
  title?: string
  description?: string
  items: FeatureItem[]
  /** Grid columns on large screens. */
  columns?: 2 | 3 | 4
}

/**
 * Feature grid: a header plus a responsive grid of feature entries with an
 * optional icon. Use for product capabilities or "why us" sections.
 */
function Features({
  title,
  description,
  items,
  columns = 3,
  className,
  ...props
}: FeaturesProps) {
  return (
    <section
      data-slot="features"
      className={cn("w-full py-16 md:py-24", className)}
      {...props}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6">
        {(title || description) && (
          <div
            data-slot="features-header"
            className="mx-auto flex max-w-2xl flex-col gap-4 text-center"
          >
            {title && (
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        <div
          data-slot="features-grid"
          className={cn(
            "grid gap-8 sm:grid-cols-2",
            columns === 2 && "lg:grid-cols-2",
            columns === 3 && "lg:grid-cols-3",
            columns === 4 && "lg:grid-cols-4"
          )}
        >
          {items.map((item) => (
            <div
              key={item.title}
              data-slot="features-item"
              className="flex flex-col gap-3"
            >
              {item.icon && (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {item.icon}
                </div>
              )}
              <h3 className="text-base font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export { Features }
