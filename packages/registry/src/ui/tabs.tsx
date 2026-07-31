"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

/**
 * Indikator aktif BERGESER, bukan muncul-hilang.
 *
 * Sebelumnya tiap trigger melukis latarnya sendiri lewat
 * `data-[state=active]:bg-background`. Akibatnya berpindah tab terasa satu
 * kotak menghilang dan kotak lain muncul — tidak ada kesinambungan, dan mata
 * kehilangan jejak elemen yang sama.
 *
 * Sekarang ada SATU elemen indikator di dalam list yang berpindah posisi.
 * Radix tidak menyediakan primitive untuk ini, jadi posisinya diukur dari
 * trigger yang sedang aktif.
 *
 * Kepatuhan `motion-standards` (emilkowalski):
 *  - easing `cubic-bezier(0.77, 0, 0.175, 1)` — standar menetapkannya khusus
 *    untuk "pindah posisi di layar", bukan `ease-out` yang dipakai masuk/keluar.
 *  - durasi 200ms (`--motion-duration-normal`), di bawah batas 300ms.
 *  - CSS `transition`, BUKAN `@keyframes` — supaya bisa di-retarget di tengah
 *    jalan. Ini penting di tab: klik cepat berturut-turut harus membelokkan
 *    gerakan yang sedang berjalan, bukan mengantre di belakangnya.
 *  - `motion-reduce` mematikan gerak, menyisakan perpindahan seketika.
 *
 * Indikator memakai `card` (#FFFFFF), BUKAN `background` (#FAFAFA). List-nya
 * ber-latar `muted` (#F9F9F9) — selisihnya dengan #FAFAFA cuma satu unit,
 * jadi pilnya nyaris tak terlihat. `card` memberi putih sungguhan, sejalan
 * dengan panel lain yang berdiri di atas permukaan.
 *
 * ⚠️ Soal menganimasikan `width` — standar melarang menganimasikan dimensi.
 * Larangan itu ada karena width memicu layout ulang dokumen. Di sini
 * indikatornya `absolute`, jadi perubahan lebarnya tidak me-reflow apa pun di
 * sekitarnya. Alternatif murni-transform adalah `scaleX`, tapi itu ikut
 * meregangkan `--tabs-trigger-radius` sehingga sudutnya penyok. Melebar
 * dipilih dengan sadar, bukan karena aturannya terlewat.
 */
function Tabs({ ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />
}

type Rect = { x: number; w: number }

function TabsList({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const listRef = React.useRef<HTMLDivElement>(null)
  const [rect, setRect] = React.useState<Rect | null>(null)
  // Penempatan pertama tidak dianimasikan — tanpa ini indikator terlihat
  // meluncur dari tepi kiri setiap kali halaman dimuat.
  const [ready, setReady] = React.useState(false)

  React.useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return

    const measure = () => {
      const active = list.querySelector<HTMLElement>(
        '[data-slot="tabs-trigger"][data-state="active"]'
      )
      if (!active) {
        setRect(null)
        return
      }
      setRect({ x: active.offsetLeft, w: active.offsetWidth })
    }

    measure()
    // Dua frame: satu untuk menempatkan, frame berikutnya baru menyalakan
    // transisi — kalau disatukan, penempatan awal ikut teranimasi.
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setReady(true))
    )

    // Radix menandai tab aktif lewat atribut DOM, bukan lewat props yang bisa
    // kita pegang dari sini — jadi perubahannya dipantau langsung.
    const mo = new MutationObserver(measure)
    mo.observe(list, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state"],
    })

    // Label yang berubah, font yang baru selesai dimuat, atau kontainer yang
    // menyempit semuanya menggeser trigger tanpa menyentuh data-state.
    const ro = new ResizeObserver(measure)
    ro.observe(list)
    list
      .querySelectorAll('[data-slot="tabs-trigger"]')
      .forEach((t) => ro.observe(t))

    return () => {
      cancelAnimationFrame(raf)
      mo.disconnect()
      ro.disconnect()
    }
  }, [])

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-slot="tabs-list"
      className={cn(
        "relative inline-flex h-9 items-center justify-center rounded-(--tabs-radius) bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {rect && (
        <span
          aria-hidden
          data-slot="tabs-indicator"
          className={cn(
            "pointer-events-none absolute left-0 top-1 h-[calc(100%-0.5rem)] rounded-(--tabs-trigger-radius) bg-card shadow-sm",
            ready &&
              "transition-[transform,width] duration-(--motion-duration-normal) ease-[cubic-bezier(0.77,0,0.175,1)] motion-reduce:transition-none"
          )}
          style={{ width: rect.w, transform: `translateX(${rect.x}px)` }}
        />
      )}
      {children}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // `relative` + z-index menaikkan label di atas indikator; tanpa itu
        // teksnya tertutup persegi putih yang lewat di depannya.
        "relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-(--tabs-trigger-radius) px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
