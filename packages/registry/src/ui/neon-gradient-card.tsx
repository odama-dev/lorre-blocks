import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Magic UI's NeonGradientCard on Lorre colors: a card wrapped in a drifting
 * accent-scale gradient border with a blurred glow copy behind it. The
 * gradient rides the shared gradient keyframe and rebuilds itself from
 * whatever theme is active. motion-reduce parks the drift (glow remains).
 */
function NeonGradientCard({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const gradient =
    "bg-[linear-gradient(90deg,var(--primary),var(--accent-8),var(--primary))] bg-[length:200%_100%] animate-gradient motion-reduce:animate-none"
  return (
    <div
      data-slot="neon-gradient-card"
      className={cn("relative rounded-2xl", className)}
      {...props}
    >
      {/* glow */}
      <div
        aria-hidden
        className={cn("absolute inset-0 rounded-2xl blur-lg opacity-60", gradient)}
      />
      {/* border */}
      <div aria-hidden className={cn("absolute inset-0 rounded-2xl", gradient)} />
      {/* surface */}
      <div className="relative m-[2px] rounded-[calc(var(--radius-2xl)-2px)] bg-card p-6 text-card-foreground">
        {children}
      </div>
    </div>
  )
}

export { NeonGradientCard }
