import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Warna diikat mengikuti komponen Figma `Input` (node 7:10), bukan konvensi
 * shadcn bawaan. Empat hal yang berbeda dari sebelumnya:
 *
 *  - latar `card` (#FFFFFF), bukan `background` (#FAFAFA) — input berdiri di
 *    atas halaman, jadi ia permukaan kartu.
 *  - garis `neutral-3` (#F0F0F0), bukan `input` (#D1D1D1) — jauh lebih halus.
 *  - fokus mengganti WARNA GARIS ke `border-active` (#335CFF), bukan menambah
 *    ring di luar. Ring tetap ada untuk keyboard, tapi warnanya menyusul garis.
 *  - placeholder `neutral-6` (#D1D1D1).
 *
 * ⚠️ Placeholder #D1D1D1 pada latar putih hanya berkontras **1.53** — di bawah
 * minimum WCAG 4.5 untuk teks, dan turun jauh dari #666666 (5.74) yang dipakai
 * sebelumnya. Ini mengikuti Figma atas permintaan eksplisit. Untuk
 * mengembalikannya, ganti `placeholder:text-neutral-6` → `placeholder:text-muted-foreground`.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-(--input-height) w-full rounded-(--input-radius) border border-neutral-3 bg-card px-(--input-px) py-1 text-(length:--input-font-size) shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-6 focus-visible:border-border-active focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-active disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
