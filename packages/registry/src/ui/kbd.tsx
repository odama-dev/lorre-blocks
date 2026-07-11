import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Represents keyboard input or a hotkey, Radix Themes style. Compose
 * sequences with plain text: <Kbd>⌘</Kbd> <Kbd>K</Kbd>.
 */
function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded border bg-muted px-1.5 font-mono text-[11px] font-medium text-muted-foreground shadow-[inset_0_-1px_0_var(--border)]",
        className
      )}
      {...props}
    />
  )
}

export { Kbd }
