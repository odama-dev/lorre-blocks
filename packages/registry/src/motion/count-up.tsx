"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface CountUpProps extends React.ComponentProps<"span"> {
  /** Final value to count to. */
  value: number
  /** Animation length in ms. */
  duration?: number
  /** Fraction digits to render, e.g. 1 for "99.9". */
  decimals?: number
  prefix?: string
  suffix?: string
  /** Start when the element scrolls into view (default) instead of on mount. */
  startOnView?: boolean
}

/**
 * Animated number that counts from 0 to `value` with an ease-out curve, once,
 * when it enters the viewport. Respects prefers-reduced-motion (jumps straight
 * to the final value). Pair with the stats block for animated KPIs.
 */
function CountUp({
  value,
  duration = 1200,
  decimals = 0,
  prefix = "",
  suffix = "",
  startOnView = true,
  className,
  ...props
}: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = React.useState(0)
  const started = React.useRef(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    const start = () => {
      if (started.current) return
      started.current = true
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setDisplay(value)
        return
      }
      const t0 = performance.now()
      const tick = (now: number) => {
        const progress = Math.min((now - t0) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplay(value * eased)
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    if (!startOnView) {
      start()
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          start()
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value, duration, startOnView])

  // One text child, formatted with a fixed locale: adjacent text nodes and
  // server/client locale drift both cause hydration mismatches in RSC apps.
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(display)

  return (
    <span
      ref={ref}
      data-slot="count-up"
      className={cn("tabular-nums", className)}
      {...props}
    >
      {`${prefix}${formatted}${suffix}`}
    </span>
  )
}

export { CountUp }
