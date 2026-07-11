import * as React from "react"

import { cn } from "@/lib/utils"

export interface MarqueeProps extends React.ComponentProps<"div"> {
  /** Pause the scroll while the pointer is over the strip. */
  pauseOnHover?: boolean
  /** Scroll right-to-left becomes left-to-right. */
  reverse?: boolean
}

/**
 * Infinite horizontal scroll strip (logo clouds, tickers). Pure CSS — the
 * content is rendered twice and translated -50% for a seamless loop, driven
 * by the `--animate-marquee` token. Override speed per instance with a
 * Tailwind arbitrary utility, e.g. `[&>div]:[animation-duration:20s]`.
 */
function Marquee({
  pauseOnHover = false,
  reverse = false,
  className,
  children,
  ...props
}: MarqueeProps) {
  const lane = cn(
    "flex w-max shrink-0 items-center gap-12 pr-12 animate-marquee motion-reduce:animate-none",
    reverse && "[animation-direction:reverse]",
    pauseOnHover && "group-hover:[animation-play-state:paused]"
  )
  return (
    <div
      data-slot="marquee"
      className={cn("group flex w-full overflow-hidden", className)}
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
