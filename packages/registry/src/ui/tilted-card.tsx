"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface TiltedCardProps extends React.ComponentProps<"div"> {
  /** Max tilt in degrees. */
  maxTilt?: number
  /** Scale while hovered. */
  hoverScale?: number
}

/**
 * React Bits' TiltedCard, reimplemented on pointer events + CSS transforms
 * (upstream is framer-motion springs): the card tilts in 3D toward the
 * pointer and eases back on leave. prefers-reduced-motion (motion-reduce)
 * keeps it flat.
 */
function TiltedCard({
  maxTilt = 12,
  hoverScale = 1.03,
  className,
  children,
  ...props
}: TiltedCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null)

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const rect = card.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    card.style.transform = `perspective(800px) rotateX(${-py * maxTilt * 2}deg) rotateY(${px * maxTilt * 2}deg) scale(${hoverScale})`
  }

  const onPointerLeave = () => {
    const card = cardRef.current
    if (card) card.style.transform = ""
  }

  return (
    <div
      ref={cardRef}
      data-slot="tilted-card"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn(
        "rounded-xl border bg-card p-6 text-card-foreground shadow-sm",
        "transition-transform duration-200 ease-out will-change-transform motion-reduce:transition-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { TiltedCard }
