import * as React from "react"

import { cn } from "@/lib/utils"

export interface StatItem {
  /** Rendered as-is, e.g. "99.9%", "4M+", "<50ms". */
  value: string
  label: string
  description?: string
}

export interface StatsProps extends React.ComponentProps<"section"> {
  title?: string
  description?: string
  items: StatItem[]
}

/**
 * Stats band: a row of large key numbers with labels. Values are free-form
 * strings so percentages, counts and latencies all work.
 */
function Stats({ title, description, items, className, ...props }: StatsProps) {
  return (
    <section
      data-slot="stats"
      className={cn("w-full py-16 md:py-24", className)}
      {...props}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6">
        {(title || description) && (
          <div
            data-slot="stats-header"
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
        <dl
          data-slot="stats-grid"
          className={cn(
            "grid grid-cols-2 gap-x-6 gap-y-10 text-center",
            items.length % 3 === 0 ? "lg:grid-cols-3" : "lg:grid-cols-4"
          )}
        >
          {items.map((item) => (
            <div
              key={item.label}
              data-slot="stats-item"
              className="flex flex-col gap-2"
            >
              <dd className="order-1 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {item.value}
              </dd>
              <dt className="order-2 text-sm font-medium text-muted-foreground">
                {item.label}
              </dt>
              {item.description && (
                <p className="order-3 text-xs text-muted-foreground">
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export { Stats }
