"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface ClickSparkProps extends React.ComponentProps<"div"> {
  /** Sparks per burst. */
  sparkCount?: number
  /** How far each spark flies, in px. */
  sparkRadius?: number
}

/**
 * React Bits' ClickSpark, reimplemented on DOM + the `--animate-click-spark`
 * token (upstream is a canvas loop): wrap any area and every click bursts
 * little rays from the pointer. Bursts clean themselves up when the last
 * spark finishes. prefers-reduced-motion (via motion-reduce) hides sparks.
 */
function ClickSpark({
  sparkCount = 8,
  sparkRadius = 24,
  className,
  children,
  ...props
}: ClickSparkProps) {
  const [bursts, setBursts] = React.useState<{ id: number; x: number; y: number }[]>([])
  const nextId = React.useRef(0)

  const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const id = nextId.current++
    setBursts((current) => [
      ...current,
      { id, x: event.clientX - rect.left, y: event.clientY - rect.top },
    ])
  }

  return (
    <div
      data-slot="click-spark"
      className={cn("relative", className)}
      onClick={onClick}
      {...props}
    >
      {children}
      {bursts.map((burst) => (
        <span
          key={burst.id}
          aria-hidden
          className="pointer-events-none absolute"
          style={{ left: burst.x, top: burst.y }}
        >
          {Array.from({ length: sparkCount }).map((_, index) => (
            // Rotation lives on the wrapper so the keyframe's transform
            // (translate along -Y) doesn't overwrite it.
            <span
              key={index}
              className="absolute block motion-reduce:hidden"
              style={{ transform: `rotate(${(360 / sparkCount) * index}deg)` }}
            >
              <span
                className="block h-3 w-0.5 rounded-full bg-primary animate-click-spark"
                style={{ "--spark-distance": `${sparkRadius}px` } as React.CSSProperties}
                onAnimationEnd={
                  index === 0
                    ? () => setBursts((current) => current.filter((b) => b.id !== burst.id))
                    : undefined
                }
              />
            </span>
          ))}
        </span>
      ))}
    </div>
  )
}

export { ClickSpark }
