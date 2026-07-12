import * as React from "react"

import { cn } from "@/lib/utils"

export interface CircularTextProps extends React.ComponentProps<"span"> {
  /** The text laid around the circle. */
  text: string
  /** Circle radius in px. */
  radius?: number
  /** Seconds per revolution. */
  duration?: number
  reverse?: boolean
}

/**
 * React Bits' CircularText, reimplemented on pure CSS (upstream is
 * framer-motion): characters sit on a ring that spins with Tailwind's
 * built-in spin keyframe. Server-renderable — positions are plain math.
 * motion-reduce parks the ring.
 */
function CircularText({
  text,
  radius = 60,
  duration = 20,
  reverse = false,
  className,
  ...props
}: CircularTextProps) {
  const chars = Array.from(text)
  return (
    <span
      data-slot="circular-text"
      aria-label={text}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: radius * 2 + 24, height: radius * 2 + 24 }}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 animate-[spin_var(--circular-duration)_linear_infinite] motion-reduce:animate-none",
          reverse && "[animation-direction:reverse]"
        )}
        style={{ "--circular-duration": `${duration}s` } as React.CSSProperties}
      >
        {chars.map((char, index) => (
          <span
            key={index}
            className="absolute left-1/2 top-1/2 font-semibold uppercase"
            style={{
              transform: `translate(-50%, -50%) rotate(${(360 / chars.length) * index}deg) translateY(${-radius}px)`,
            }}
          >
            {char}
          </span>
        ))}
      </span>
    </span>
  )
}

export { CircularText }
