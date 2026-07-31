import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-(--button-radius) font-(--button-font-weight) transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Hitam lewat component token, BUKAN --primary. DL-DS-009.
        default:
          "bg-button-background text-button-foreground hover:bg-button-background/90",
        // Biru — peran terpisah dari `default`. Namanya menyebut peran, bukan
        // rupa, supaya tidak menyesatkan kalau warnanya berubah.
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // Garis GELAP (card-foreground), bukan abu — inilah yang membedakannya
        // dari `secondary`. Latarnya transparan, bukan warna halaman.
        outline:
          "border border-card-foreground text-foreground hover:bg-accent hover:text-accent-foreground",
        // Putih berbingkai halus + shadow. Satu-satunya varian Button yang
        // ber-shadow di Figma (drop shadow r=2, diverifikasi 2026-07-31).
        secondary:
          "border border-neutral-3 bg-card text-foreground shadow-xs hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-(--button-height) px-(--button-px) py-2 text-(length:--button-font-size)",
        sm: "h-(--button-height-sm) px-(--button-px-sm) text-(length:--button-font-size-sm)",
        lg: "h-(--button-height-lg) px-(--button-px-lg) text-(length:--button-font-size-lg)",
        icon: "h-(--button-height) w-(--button-height) text-(length:--button-font-size)",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
