import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-(--badge-radius) border px-(--badge-px) py-(--badge-py) text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        // Badge Odama LEMBUT, bukan solid: latar langkah 3 dari ramp, teks
        // langkah 10. Ini bahasa desain yang berbeda dari shadcn bawaan —
        // solid biru penuh diganti tint biru dengan teks biru tua.
        default: "border-transparent bg-accent-3 text-accent-10",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-danger-3 text-danger-10",
        success: "border-transparent bg-success-3 text-success-10",
        warning: "border-transparent bg-warning-3 text-warning-10",
        outline: "border-border text-neutral-10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof badgeVariants>) {
  return (
    <div
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
