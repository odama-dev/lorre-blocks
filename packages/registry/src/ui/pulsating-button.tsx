import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Magic UI's PulsatingButton: a primary button radiating a soft pulse ring —
 * for the one action you want noticed. Tailwind's built-in ping keyframe,
 * slowed; motion-reduce disables the ring.
 */
function PulsatingButton({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="pulsating-button"
      className={cn(
        "relative inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground",
        "transition-transform motion-reduce:transition-none hover:bg-primary/90 active:scale-95 disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        className="absolute inset-0 -z-10 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] rounded-lg bg-primary/60 motion-reduce:hidden"
      />
      {children}
    </button>
  )
}

export { PulsatingButton }
