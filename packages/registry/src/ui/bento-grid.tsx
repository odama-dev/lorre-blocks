import * as React from "react"
import { ArrowRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Magic UI's BentoGrid: an asymmetric feature grid. Each card takes a
 * background slot (image, effect, chart…) revealed behind the copy; the CTA
 * slides up on hover. Span cards with col-span/row-span utilities via
 * className. Links are plain <a> so the grid works in any React app.
 */
function BentoGrid({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bento-grid"
      className={cn("grid w-full auto-rows-[minmax(180px,auto)] grid-cols-3 gap-4", className)}
      {...props}
    />
  )
}

function BentoCard({
  className,
  name,
  description,
  href,
  cta = "Learn more",
  background,
  icon: Icon,
  ...props
}: React.ComponentProps<"div"> & {
  name: string
  description: string
  href?: string
  cta?: string
  /** Rendered behind the copy — image, gradient, chart, effect… */
  background?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div
      data-slot="bento-card"
      className={cn(
        "group relative flex flex-col justify-end overflow-hidden rounded-xl border bg-card p-6",
        className
      )}
      {...props}
    >
      {background && <div className="absolute inset-0">{background}</div>}
      <div className="pointer-events-none relative z-10 flex flex-col gap-1 transition-transform duration-300 group-hover:-translate-y-8 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
        {Icon && <Icon className="mb-2 size-8 text-muted-foreground" />}
        <h3 className="text-lg font-semibold text-card-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {href && (
        <div className="absolute inset-x-6 bottom-4 z-10 translate-y-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none">
          <a
            href={href}
            className="pointer-events-auto inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {cta}
            <ArrowRightIcon className="size-3.5" />
          </a>
        </div>
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-colors duration-300 group-hover:bg-foreground/[0.02]"
      />
    </div>
  )
}

export { BentoGrid, BentoCard }
