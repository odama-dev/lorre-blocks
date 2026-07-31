import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-(--badge-gap) rounded-(--badge-radius) border pl-(--badge-pl) pr-(--badge-pr) py-(--badge-py) text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        // Badge Odama LEMBUT, bukan solid: latar langkah 3 dari ramp, teks
        // langkah 10, dot langkah 9 (secondary/outline: neutral-6). Ini bahasa
        // desain yang berbeda dari shadcn bawaan — solid biru penuh diganti
        // tint biru dengan teks biru tua (Figma `badge` node 9:23).
        default:
          "border-transparent bg-accent-3 text-accent-10 [--badge-dot:var(--accent-9)]",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [--badge-dot:var(--neutral-6)]",
        destructive:
          "border-transparent bg-danger-3 text-danger-10 [--badge-dot:var(--danger-9)]",
        success:
          "border-transparent bg-success-3 text-success-10 [--badge-dot:var(--success-9)]",
        warning:
          "border-transparent bg-warning-3 text-warning-10 [--badge-dot:var(--warning-9)]",
        outline: "border-border text-neutral-10 [--badge-dot:var(--neutral-6)]",
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
  dot = true,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof badgeVariants> & {
    dot?: boolean
  }) {
  return (
    <div
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {dot && (
        <span
          aria-hidden
          data-slot="badge-dot"
          className="size-(--badge-dot-size) shrink-0 rounded-full bg-(--badge-dot)"
        />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
