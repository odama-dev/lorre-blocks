"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Magic UI's AnimatedBeam: an animated connection line between two elements
 * inside a shared container (integration diagrams, data-flow illustrations).
 * The path is computed from the refs' positions (kept fresh with a
 * ResizeObserver); the traveling pulse is an SVG SMIL gradient animation —
 * no JS animation loop, no runtime deps. motion-reduce shows the static line.
 */
function AnimatedBeam({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  duration = 4,
  ...props
}: React.ComponentProps<"svg"> & {
  containerRef: React.RefObject<HTMLElement | null>
  fromRef: React.RefObject<HTMLElement | null>
  toRef: React.RefObject<HTMLElement | null>
  /** Vertical bend in px; 0 = straight line. */
  curvature?: number
  /** Seconds per pulse. */
  duration?: number
}) {
  const id = React.useId().replace(/:/g, "")
  const [path, setPath] = React.useState("")
  const [box, setBox] = React.useState({ width: 0, height: 0 })

  React.useEffect(() => {
    const update = () => {
      const container = containerRef.current
      const from = fromRef.current
      const to = toRef.current
      if (!container || !from || !to) return
      const c = container.getBoundingClientRect()
      const a = from.getBoundingClientRect()
      const b = to.getBoundingClientRect()
      const x1 = a.left - c.left + a.width / 2
      const y1 = a.top - c.top + a.height / 2
      const x2 = b.left - c.left + b.width / 2
      const y2 = b.top - c.top + b.height / 2
      const cx = (x1 + x2) / 2
      const cy = (y1 + y2) / 2 - curvature
      setBox({ width: c.width, height: c.height })
      setPath(`M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`)
    }
    update()
    const observer = new ResizeObserver(update)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [containerRef, fromRef, toRef, curvature])

  return (
    <svg
      data-slot="animated-beam"
      aria-hidden
      width={box.width}
      height={box.height}
      viewBox={`0 0 ${box.width} ${box.height}`}
      className={cn("pointer-events-none absolute inset-0", className)}
      fill="none"
      {...props}
    >
      <path d={path} stroke="var(--border)" strokeWidth="2" />
      <path
        d={path}
        stroke={`url(#beam-${id})`}
        strokeWidth="2"
        strokeLinecap="round"
        className="motion-reduce:hidden"
      />
      <defs>
        <linearGradient id={`beam-${id}`} gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--primary)" stopOpacity="0" />
          <stop stopColor="var(--primary)" />
          <stop offset="0.5" stopColor="var(--accent-8)" />
          <stop offset="1" stopColor="var(--accent-8)" stopOpacity="0" />
          <animate
            attributeName="x1"
            values="-20%;120%"
            dur={`${duration}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            values="0%;140%"
            dur={`${duration}s`}
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>
    </svg>
  )
}

export { AnimatedBeam }
