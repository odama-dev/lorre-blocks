import * as React from "react"

import { cn } from "@/lib/utils"

export interface MarqueeProps extends React.ComponentProps<"div"> {
  /** Pause the scroll while the pointer is over the strip. */
  pauseOnHover?: boolean
  /** Scroll right-to-left becomes left-to-right (or bottom-up becomes top-down). */
  reverse?: boolean
  /** Scroll vertically instead — give the container a height. */
  vertical?: boolean
}

/**
 * Infinite scroll strip (logo clouds, tickers, testimonial columns). Pure
 * CSS — the content is rendered twice and translated -50% for a seamless
 * loop, driven by the `--animate-marquee` / `--animate-marquee-vertical`
 * tokens. Override speed per instance with a Tailwind arbitrary utility,
 * e.g. `[&>div]:[animation-duration:20s]`.
 */
function Marquee({
  pauseOnHover = false,
  reverse = false,
  vertical = false,
  className,
  children,
  ...props
}: MarqueeProps) {
  const lane = cn(
    "flex shrink-0 items-center gap-12 motion-reduce:animate-none",
    vertical
      ? "h-max flex-col pb-12 animate-marquee-vertical"
      : "w-max pr-12 animate-marquee",
    reverse && "[animation-direction:reverse]",
    pauseOnHover && "group-hover:[animation-play-state:paused]"
  )
  return (
    <div
      data-slot="marquee"
      className={cn(
        "group flex overflow-hidden",
        vertical ? "h-full flex-col" : "w-full",
        className
      )}
      {...props}
    >
      <div className={lane}>{children}</div>
      <div className={lane} aria-hidden>
        {children}
      </div>
    </div>
  )
}

export { Marquee }
