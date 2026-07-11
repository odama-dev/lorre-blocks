import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Radix Themes' Spinner: eight fading blades, pure CSS on the caret-blink-free
 * path — each blade animates opacity with a staggered delay. Size via the
 * `size-*` utilities (defaults to 1em so it follows font size). Honors
 * prefers-reduced-motion by slowing to a gentle pulse.
 */
function Spinner({
  className,
  "aria-label": ariaLabel = "Loading",
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="spinner"
      role="status"
      aria-label={ariaLabel}
      className={cn("relative inline-block size-[1em]", className)}
      {...props}
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <span
          key={index}
          className="absolute inset-x-[46.5%] top-0 h-[30%] w-[7%] animate-[lorre-fade-in_0.8s_linear_infinite_alternate] rounded-full bg-current motion-reduce:animate-[lorre-fade-in_1.6s_ease-in-out_infinite_alternate]"
          style={{
            transform: `rotate(${index * 45}deg)`,
            transformOrigin: "center 166%",
            animationDelay: `${-(8 - index) * 100}ms`,
            opacity: 0.3,
          }}
        />
      ))}
    </span>
  )
}

export { Spinner }
