import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full rounded-(--input-radius) border border-neutral-3 bg-card px-(--input-px) py-2 text-sm transition-colors placeholder:text-neutral-6 focus-visible:border-border-active focus-visible:bg-background focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-background disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
