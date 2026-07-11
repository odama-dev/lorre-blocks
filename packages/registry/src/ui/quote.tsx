import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Radix Themes' Quote: a short inline citation — semantic <q> with theme
 * quotation marks. For block-level quotes use TypographyBlockquote.
 */
function Quote({ className, ...props }: React.ComponentProps<"q">) {
  return (
    <q
      data-slot="quote"
      className={cn("font-serif italic text-foreground/90", className)}
      {...props}
    />
  )
}

export { Quote }
