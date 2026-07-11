import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const calloutVariants = cva(
  "flex items-start gap-3 rounded-lg p-4 text-sm [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        // Radix Themes "soft" look: tinted surface from the matching scale.
        info: "bg-accent-3 text-accent-11 [&>svg]:text-accent-11",
        success: "bg-success-3 text-success-11 [&>svg]:text-success-11",
        warning: "bg-warning-3 text-warning-11 [&>svg]:text-warning-11",
        danger: "bg-danger-3 text-danger-11 [&>svg]:text-danger-11",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

/**
 * Radix Themes' Callout: a short message that attracts attention without
 * interrupting — softer than an alert, tinted straight from the Lorre color
 * scales so every theme recolors it. Put an icon first, then CalloutText.
 */
function Callout({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof calloutVariants>) {
  return (
    <div
      data-slot="callout"
      role="note"
      className={cn(calloutVariants({ variant }), className)}
      {...props}
    />
  )
}

function CalloutText({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="callout-text"
      className={cn("leading-relaxed", className)}
      {...props}
    />
  )
}

export { Callout, CalloutText, calloutVariants }
