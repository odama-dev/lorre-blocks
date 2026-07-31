import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full rounded-(--input-radius) border border-neutral-3 bg-card px-(--input-px) py-2 text-sm shadow-sm transition-colors placeholder:text-neutral-6 focus-visible:border-border-active focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-active disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
