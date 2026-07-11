import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Magic UI's OrbitingCircles: children orbit the center of the nearest
 * `relative` container. Pure CSS — the orbit is Tailwind's spin keyframe on
 * a positioning wrapper, with a counter-rotation keeping each child upright.
 * Stack several with different radius/duration/reverse for solar-system
 * layouts. motion-reduce parks the orbit.
 */
function OrbitingCircles({
  className,
  children,
  radius = 80,
  duration = 20,
  reverse = false,
  path = true,
  ...props
}: React.ComponentProps<"div"> & {
  /** Orbit radius in px. */
  radius?: number
  /** Seconds per revolution. */
  duration?: number
  reverse?: boolean
  /** Draw the dashed orbit track. */
  path?: boolean
}) {
  const items = React.Children.toArray(children)
  return (
    <>
      {path && (
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-border"
          style={{ width: radius * 2, height: radius * 2 }}
        />
      )}
      {items.map((child, index) => {
        const angle = (360 / items.length) * index
        return (
          <div
            key={index}
            data-slot="orbiting-circles"
            className={cn(
              "absolute top-1/2 left-1/2 size-0 animate-[spin_var(--orbit-duration)_linear_infinite] motion-reduce:animate-none",
              reverse && "[animation-direction:reverse]",
              className
            )}
            style={
              {
                "--orbit-duration": `${duration}s`,
                transform: `rotate(${angle}deg)`,
              } as React.CSSProperties
            }
            {...props}
          >
            <div
              className={cn(
                "absolute flex -translate-x-1/2 -translate-y-1/2 animate-[spin_var(--orbit-duration)_linear_infinite_reverse] items-center justify-center motion-reduce:animate-none",
                reverse && "[animation-direction:normal]"
              )}
              style={{ transform: `translateY(-${radius}px) translateX(-50%)` }}
            >
              {child}
            </div>
          </div>
        )
      })}
    </>
  )
}

export { OrbitingCircles }
