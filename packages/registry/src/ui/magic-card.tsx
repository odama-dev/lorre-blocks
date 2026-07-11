"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Magic UI's MagicCard: a spotlight that follows the pointer across the card
 * — one radial gradient tints the border, a softer one washes the surface.
 * Upstream uses framer-motion for this; two CSS variables driven from a
 * pointermove handler give the same fidelity with zero runtime deps.
 */
function MagicCard({
  className,
  children,
  gradientSize = 200,
  ...props
}: React.ComponentProps<"div"> & {
  /** Spotlight radius in px. */
  gradientSize?: number
}) {
  const ref = React.useRef<HTMLDivElement>(null)

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    ref.current!.style.setProperty("--mx", `${event.clientX - rect.left}px`)
    ref.current!.style.setProperty("--my", `${event.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      data-slot="magic-card"
      onPointerMove={handlePointerMove}
      className={cn("group relative rounded-xl", className)}
      style={
        {
          "--mx": "50%",
          "--my": "50%",
          "--gradient-size": `${gradientSize}px`,
        } as React.CSSProperties
      }
      {...props}
    >
      {/* border tint */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl bg-border opacity-100 [background:radial-gradient(var(--gradient-size)_circle_at_var(--mx)_var(--my),var(--primary),var(--border)_70%)]"
      />
      {/* surface + spotlight wash */}
      <div className="relative m-px rounded-[calc(var(--radius-xl)-1px)] bg-card text-card-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(var(--gradient-size)_circle_at_var(--mx)_var(--my),var(--accent-3),transparent_70%)]"
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  )
}

export { MagicCard }
