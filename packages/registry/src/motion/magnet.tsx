"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface MagnetProps extends React.ComponentProps<"div"> {
  /** Extra attraction zone around the content, in px. */
  padding?: number
  /** 1 = content sticks to the pointer, higher = subtler pull. */
  strength?: number
}

/**
 * React Bits' Magnet, reimplemented on pointer events + CSS transitions
 * (upstream is framer-motion springs): the content leans toward the pointer
 * while it is inside the attraction zone and eases back when it leaves.
 * prefers-reduced-motion disables the pull.
 */
function Magnet({
  padding = 40,
  strength = 3,
  className,
  children,
  ...props
}: MagnetProps) {
  const zoneRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const zone = zoneRef.current
    const content = contentRef.current
    if (!zone || !content) return
    const onMove = (event: PointerEvent) => {
      const rect = zone.getBoundingClientRect()
      const inside =
        event.clientX > rect.left - padding &&
        event.clientX < rect.right + padding &&
        event.clientY > rect.top - padding &&
        event.clientY < rect.bottom + padding
      if (inside) {
        const dx = event.clientX - (rect.left + rect.width / 2)
        const dy = event.clientY - (rect.top + rect.height / 2)
        content.style.transform = `translate(${dx / strength}px, ${dy / strength}px)`
      } else {
        content.style.transform = "translate(0, 0)"
      }
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [padding, strength])

  return (
    <div ref={zoneRef} data-slot="magnet" className={cn("inline-block", className)} {...props}>
      <div
        ref={contentRef}
        className="transition-transform duration-200 ease-out will-change-transform motion-reduce:transition-none"
      >
        {children}
      </div>
    </div>
  )
}

export { Magnet }
