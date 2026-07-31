"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" {...props} />
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

/**
 * Panah 12×6, mengikuti scaffold Figma `Tooltip` node 240:428 (DL-DS-018).
 *
 * Tanpa panah, tooltip hanya kotak melayang — hubungannya ke elemen pemicu
 * hanya tersirat dari kedekatan. Panah membuatnya eksplisit.
 *
 * `sideOffset` naik 4 → 6 menyesuaikan TINGGI panah. Kalau tetap 4, ujung
 * panah menembus ke dalam trigger karena panah menempati ruang offset itu.
 *
 * `overflow-hidden` DIPINDAH dari Content ke pembungkus teks. Di Content ia
 * ikut memotong panah — panah dirender sebagai anak Content dan menonjol ke
 * luar batasnya, jadi persis itu yang di-clip.
 *
 * `max-w-xs` (320px) membatasi lebar supaya kalimat panjang MEMBUNGKUS jadi
 * beberapa baris, bukan memanjang jadi satu pita tipis melintasi layar —
 * baris sepanjang itu sulit dibaca dan menutupi konten di belakangnya.
 * `text-balance` meratakan panjang antar baris supaya tidak ada baris terakhir
 * yang cuma berisi satu kata.
 *
 * CURSOR: komponen ini sengaja TIDAK mengatur cursor. `TooltipTrigger` sering
 * dipakai dengan `asChild`, dan className-nya ikut menempel ke anaknya — kalau
 * dipaksa `cursor-help`, tombol yang dibungkus tooltip akan kehilangan
 * `cursor-pointer`-nya. Aturannya di sisi pemakai:
 *   - pemicu berupa AKSI (button/link) → biarkan cursor bawaannya
 *   - pemicu berupa INFORMASI (badge, ikon, teks) → beri `cursor-help`
 */
const ARROW_W = 12
const ARROW_H = 6

function TooltipContent({
  className,
  sideOffset = ARROW_H,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-w-xs text-balance rounded-(--tooltip-radius) bg-neutral-12 px-(--tooltip-px) py-(--tooltip-py) text-xs text-neutral-1 animate-panel-in motion-reduce:animate-none",
          className
        )}
        {...props}
      >
        <span className="block overflow-hidden">{children}</span>
        <TooltipPrimitive.Arrow
          data-slot="tooltip-arrow"
          width={ARROW_W}
          height={ARROW_H}
          // fill-, bukan bg- — Radix merender panah sebagai <svg><polygon>.
          className="fill-neutral-12"
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
