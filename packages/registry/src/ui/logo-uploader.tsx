"use client"

import * as React from "react"
import {
  UploadCloud01,
  RefreshCw01,
  Trash01,
  AlertTriangle,
} from "@untitledui/icons"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

/**
 * CS-133 ← CMP-133 (BR-002) — Logo Uploader
 *
 * Sumber: AC-002-07 (field logo opsional) + AC-002-08 (fallback inisial).
 * Figma: component set `Logo Uploader` 185:445, lima varian State.
 *
 * ⚠️ Perlakuan gambar BERGANTUNG RASIO (DL-DS-014d + DL-DS-016):
 *
 * - **Persegi (1:1 ±5%)** → mengisi penuh lingkaran (`object-cover`). Sudut
 *   terpotong mask lingkaran; itu diterima dan memang tampilan lazim.
 * - **Non-persegi** → diperkecil proporsional lalu di-fit dengan padding
 *   (`object-contain`). Tidak pernah dipotong.
 *
 * Konsekuensi yang diterima pada jalur contain: wordmark lebar tampil kecil
 * di lingkaran 80px. Kalau itu dinilai buruk, naikkan `size` atau ganti
 * bentuk — jangan alihkan wordmark ke cover, karena itu memotong merek
 * perusahaan orang.
 *
 * `AvatarImage` bawaan memakai `aspect-square h-full w-full` yang selalu
 * berperilaku cover, jadi kelasnya WAJIB di-override di sini.
 *
 * Di luar cakupan (spec §9): galeri banyak gambar, lampiran berkas umum
 * (CS-088), foto profil user, filter/efek gambar, unggah dari URL.
 *
 * ⚠️ Mekanisme object storage sengaja TIDAK diputuskan di sini — sama seperti
 * CS-088. Komponen menerima `onUpload` sehingga pemanggil yang menentukan
 * presigned-URL vs proxy API. Menunggu Contract Keeper.
 */

export type LogoUploaderProps = {
  /** Dipakai untuk inisial fallback. Wajib — tanpa ini fallback tak punya isi. */
  companyName: string
  /** URL logo yang sudah tersimpan. Kosong/null = state `empty`. */
  value?: string | null
  /** Dipanggil setelah unggah sukses (URL baru) atau setelah dihapus (null). */
  onChange?: (url: string | null) => void
  /** Pemanggil yang memutuskan mekanisme storage. Mengembalikan URL final. */
  onUpload?: (file: File, onProgress: (pct: number) => void) => Promise<string>
  accept?: string
  /** Batas ukuran dalam byte. Ditulis ke user SEBELUM ia mencoba (spec §3.8). */
  maxSize?: number
  /** Diameter lingkaran. 80 = default Figma — nilai ini pilihan desain, bukan dari AC-. */
  size?: number
  disabled?: boolean
  className?: string
}

const DEFAULT_ACCEPT = ".png,.jpg,.jpeg,.svg"
const DEFAULT_MAX = 2 * 1024 * 1024

/**
 * Seberapa jauh dari 1:1 masih dianggap "persegi" dan boleh mengisi penuh
 * lingkaran. 0,05 = toleransi ±5% (rasio 0,95–1,05).
 *
 * ⚠️ Angka ini pilihan agent, BUKAN dari requirement. Human memutuskan
 * "rasio 1:1 mengisi lingkaran" tanpa menyebut ambang. Logo 512×500 secara
 * praktis persegi tapi bukan 1:1 persis; tanpa toleransi ia akan jatuh ke
 * jalur contain dan tampak mengambang lebih kecil dari logo tetangganya.
 * Naikkan bila banyak logo hampir-persegi ikut ter-padding.
 */
const SQUARE_TOLERANCE = 0.05

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  const mb = bytes / (1024 * 1024)
  return `${mb % 1 === 0 ? mb : mb.toFixed(1)} MB`
}

/**
 * "PT Maju Jaya" → "MJ". Membuang prefiks badan usaha yang umum di Indonesia.
 *
 * ⚠️ Sengaja diduplikasi dari `kanban-board.tsx` (DL-DS-013) — item registry
 * disalin berdiri sendiri ke proyek konsumen, jadi tidak bisa saling impor.
 * Kalau logika ini berubah, ubah di KEDUA tempat; kalau tidak, kartu kanban
 * dan uploader akan menampilkan inisial berbeda untuk perusahaan yang sama.
 */
function initialsFrom(name: string) {
  const words = name
    .replace(/^(PT|CV|UD|PD|Tbk)\.?\s+/i, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  return words
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("")
}

function LogoUploader({
  companyName,
  value,
  onChange,
  onUpload,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX,
  size = 80,
  disabled = false,
  className,
}: LogoUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [progress, setProgress] = React.useState<number | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  // Ditetapkan saat gambar selesai dimuat — rasio asli baru diketahui di situ.
  const [fit, setFit] = React.useState<"contain" | "cover">("contain")

  // Logo berganti → rasio lama tidak berlaku lagi. Tanpa reset ini, logo
  // wordmark yang menggantikan logo persegi akan ikut ter-`cover` dan terpotong.
  React.useEffect(() => {
    setFit("contain")
  }, [value])

  const accepted = React.useMemo(
    () => accept.split(",").map((a) => a.trim().toLowerCase()),
    [accept]
  )

  const state = error
    ? "error"
    : progress !== null
      ? "uploading"
      : value
        ? "filled"
        : "empty"

  const pick = () => {
    if (!disabled) inputRef.current?.click()
  }

  const handleFile = async (file: File | undefined) => {
    if (!file || disabled) return
    setError(null)

    const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase()
    if (accepted.length && !accepted.includes(ext)) {
      setError("Tipe berkas tidak didukung")
      return
    }
    if (file.size > maxSize) {
      setError(`Ukuran melebihi ${formatSize(maxSize)}`)
      return
    }
    if (!onUpload) return

    setProgress(0)
    try {
      const url = await onUpload(file, (pct) => setProgress(pct))
      setProgress(null)
      onChange?.(url)
    } catch {
      setProgress(null)
      setError("Gagal mengunggah")
    }
  }

  const remove = () => {
    setError(null)
    // Kembali ke inisial, BUKAN lingkaran kosong (spec §5).
    onChange?.(null)
  }

  const initials = initialsFrom(companyName)
  const constraint = `${accepted
    .map((a) => a.replace(".", "").toUpperCase())
    .join(", ")} · maksimum ${formatSize(maxSize)}`

  return (
    <div
      data-slot="logo-uploader"
      data-state={state}
      className={cn("flex flex-col items-center gap-2.5", className)}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          void handleFile(e.target.files?.[0])
          e.target.value = ""
        }}
      />

      {/* Lingkaran ini <button> supaya punya jalur keyboard — overlay aksi
          tidak boleh hanya muncul saat hover (spec §3.3). */}
      <button
        type="button"
        onClick={pick}
        disabled={disabled}
        aria-label={
          value ? `Ganti logo ${companyName}` : `Unggah logo ${companyName}`
        }
        style={{ width: size, height: size }}
        className={cn(
          "group relative shrink-0 rounded-full transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <Avatar
          style={{ width: size, height: size }}
          className={cn(
            "h-full w-full border",
            state === "error" ? "border-2 border-destructive" : "border-border",
            state !== "error" && "group-hover:border-primary"
          )}
        >
          {value ? (
            /**
             * Perlakuan bergantung rasio (DL-DS-016):
             *
             * - **Persegi (1:1)** → `object-cover`, TANPA padding: logo mengisi
             *   penuh lingkaran. Sudutnya terpotong mask — itu diterima, dan
             *   memang tampilan lazim untuk logo persegi.
             * - **Non-persegi** → `object-contain` + padding: tidak pernah
             *   dipotong (DL-DS-014d).
             *
             * Padding non-persegi BUKAN angka selera. Persegi terbesar yang
             * muat penuh di dalam lingkaran ⌀d bersisi d/√2 ≈ 0,707d, jadi
             * padding minimum tiap sisi = (d − 0,707d)/2 ≈ 0,146d. Dibulatkan
             * ke 0,15d supaya rasio apa pun aman.
             */
            <AvatarImage
              src={value}
              alt={`Logo ${companyName}`}
              onLoad={(e) => {
                const img = e.currentTarget
                if (!img.naturalWidth || !img.naturalHeight) return
                const r = img.naturalWidth / img.naturalHeight
                setFit(Math.abs(r - 1) <= SQUARE_TOLERANCE ? "cover" : "contain")
              }}
              style={
                fit === "cover"
                  ? undefined
                  : { padding: Math.round(size * 0.15) }
              }
              className={cn(
                "h-full w-full",
                fit === "cover" ? "object-cover" : "object-contain"
              )}
            />
          ) : null}
          <AvatarFallback
            className="bg-muted text-muted-foreground"
            style={{ fontSize: Math.round(size * 0.3) }}
          >
            {state === "error" ? (
              <AlertTriangle
                className="text-destructive"
                style={{ width: size * 0.28, height: size * 0.28 }}
              />
            ) : (
              <span className="font-semibold">{initials}</span>
            )}
          </AvatarFallback>
        </Avatar>

        {/* Overlay: hover/fokus saat kosong-atau-terisi, dan selalu saat uploading */}
        <span
          data-slot="overlay"
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-foreground/45 text-background",
            progress !== null
              ? "opacity-100"
              : "opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          )}
        >
          {progress !== null ? (
            <span className="text-[15px] font-semibold">{progress}%</span>
          ) : (
            <UploadCloud01 style={{ width: size * 0.25, height: size * 0.25 }} />
          )}
        </span>
      </button>

      {state === "uploading" && (
        <>
          <Progress value={progress ?? 0} style={{ width: size }} className="h-2" />
          <span className="text-[11px] text-muted-foreground">Mengunggah…</span>
        </>
      )}

      {state === "filled" && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={pick}
            className="flex items-center gap-1 rounded-(--button-radius) text-xs font-medium text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <RefreshCw01 className="size-3.5" />
            Ganti
          </button>
          <button
            type="button"
            onClick={remove}
            className="flex items-center gap-1 rounded-(--button-radius) text-xs font-medium text-destructive transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <Trash01 className="size-3.5" />
            Hapus
          </button>
        </div>
      )}

      {state === "error" && (
        <>
          <span role="alert" className="text-xs font-medium text-destructive">
            {error}
          </span>
          <button
            type="button"
            onClick={pick}
            className="text-[11px] font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Pilih berkas lain
          </button>
        </>
      )}

      {state === "empty" && (
        <>
          <span className="text-[13px] font-medium text-primary">
            Klik untuk mengunggah logo
          </span>
          {/* Batasan ditulis sebelum user mencoba (spec §3.8) */}
          <span className="text-[11px] text-muted-foreground">{constraint}</span>
        </>
      )}
    </div>
  )
}

export { LogoUploader, initialsFrom }
