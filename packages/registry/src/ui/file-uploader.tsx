"use client"

import * as React from "react"
import {
  UploadCloud01,
  File02,
  Trash01,
  XClose,
  AlertTriangle,
} from "@untitledui/icons"

import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

/**
 * CS-088 ← CMP-088 (BR-018) — File Uploader
 *
 * Sumber: AC-018-03, AC-018-04, D-018-02 (section bawah).
 * Lampiran opsional (PDF/DOCX/aset) ke sebuah record.
 *
 * Di luar cakupan (spec §9): preview/viewer isi berkas, edit, folder, versioning,
 * share link, integrasi GDrive/Figma (BR-026), logo perusahaan (CS-133).
 *
 * ⚠️ Penyimpanan sengaja TIDAK diputuskan di sini (spec §10). IA menulis
 * "generic object storage — mekanisme final TBD Backend". Komponen menerima
 * `onUpload` sehingga pemanggil yang menentukan presigned-URL vs proxy API.
 */

export type UploadedFile = {
  id: string
  name: string
  size: number
  /** 0–100 saat berjalan; undefined bila sudah selesai. */
  progress?: number
  error?: string
}

export type FileUploaderProps = {
  files?: UploadedFile[]
  onFilesChange?: (files: UploadedFile[]) => void
  /** Dipanggil per berkas. Pemanggil yang memutuskan mekanisme storage. */
  onUpload?: (file: File, onProgress: (pct: number) => void) => Promise<void>
  accept?: string
  /** Batas ukuran dalam byte. Ditampilkan ke user sebelum ia mencoba (spec §3.6). */
  maxSize?: number
  disabled?: boolean
  className?: string
}

const DEFAULT_ACCEPT = ".pdf,.docx,.png,.jpg,.jpeg"
const DEFAULT_MAX = 10 * 1024 * 1024

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  const mb = bytes / (1024 * 1024)
  // Buang desimal .0 — "10 MB", bukan "10.0 MB"
  return `${mb % 1 === 0 ? mb : mb.toFixed(1)} MB`
}

function FileRow({
  file,
  onRemove,
  onCancel,
}: {
  file: UploadedFile
  onRemove: (id: string) => void
  onCancel: (id: string) => void
}) {
  const uploading = file.progress !== undefined
  return (
    <div
      data-slot="file-row"
      data-state={file.error ? "error" : uploading ? "uploading" : "uploaded"}
      className={cn(
        "flex w-full items-center gap-2 rounded-(--radius-sm) px-3 py-2",
        file.error ? "bg-destructive/10" : "bg-muted"
      )}
    >
      <File02
        className={cn(
          "size-5 shrink-0",
          file.error ? "text-destructive" : "text-muted-foreground"
        )}
      />
      <span
        className={cn(
          "truncate text-[13px]",
          file.error ? "text-destructive" : "text-foreground"
        )}
      >
        {file.name}
      </span>

      {uploading ? (
        <>
          <Progress value={file.progress} className="h-2 min-w-0 flex-1" />
          <button
            type="button"
            aria-label={`Batalkan unggah ${file.name}`}
            onClick={() => onCancel(file.id)}
            className="shrink-0 rounded-(--button-radius) text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <XClose className="size-4" />
          </button>
        </>
      ) : (
        <>
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
            {formatSize(file.size)}
          </span>
          <button
            type="button"
            aria-label={`Hapus ${file.name}`}
            onClick={() => onRemove(file.id)}
            className="shrink-0 rounded-(--button-radius) text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <Trash01 className="size-4" />
          </button>
        </>
      )}
    </div>
  )
}

function FileUploader({
  files = [],
  onFilesChange,
  onUpload,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX,
  disabled = false,
  className,
}: FileUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = React.useState(false)
  const [rejected, setRejected] = React.useState<string | null>(null)

  const accepted = React.useMemo(
    () => accept.split(",").map((a) => a.trim().toLowerCase()),
    [accept]
  )

  const validate = React.useCallback(
    (file: File): string | null => {
      const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase()
      if (accepted.length && !accepted.includes(ext))
        return `${file.name} — tipe berkas tidak didukung`
      if (file.size > maxSize)
        return `${file.name} melebihi ${formatSize(maxSize)} — coba lagi`
      return null
    },
    [accepted, maxSize]
  )

  const handleFiles = React.useCallback(
    async (list: FileList | null) => {
      if (!list || disabled) return
      setRejected(null)
      for (const file of Array.from(list)) {
        const problem = validate(file)
        if (problem) {
          setRejected(problem)
          continue
        }
        const id = `${file.name}-${file.size}-${file.lastModified}`
        const entry: UploadedFile = {
          id,
          name: file.name,
          size: file.size,
          progress: 0,
        }
        onFilesChange?.([...files, entry])
        if (!onUpload) continue
        try {
          await onUpload(file, (pct) => {
            onFilesChange?.(
              [...files, entry].map((f) =>
                f.id === id ? { ...f, progress: pct } : f
              )
            )
          })
          onFilesChange?.(
            [...files, entry].map((f) =>
              f.id === id ? { ...f, progress: undefined } : f
            )
          )
        } catch {
          onFilesChange?.(
            [...files, entry].map((f) =>
              f.id === id
                ? { ...f, progress: undefined, error: "Gagal mengunggah" }
                : f
            )
          )
        }
      }
    },
    [disabled, files, onFilesChange, onUpload, validate]
  )

  const remove = (id: string) =>
    onFilesChange?.(files.filter((f) => f.id !== id))

  const hasError = rejected !== null || files.some((f) => f.error)

  return (
    <div
      data-slot="file-uploader"
      data-state={
        hasError
          ? "error"
          : dragOver
            ? "drag-over"
            : files.some((f) => f.progress !== undefined)
              ? "uploading"
              : files.length
                ? "uploaded"
                : "empty"
      }
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        void handleFiles(e.dataTransfer.files)
      }}
      className={cn(
        "flex w-full flex-col gap-3 rounded-(--radius-md) border p-4 transition-colors",
        files.length && !hasError && !dragOver
          ? "border-solid border-border bg-card"
          : "border-dashed",
        hasError && "border-destructive bg-card",
        dragOver && !hasError && "border-primary bg-accent-1",
        !hasError && !dragOver && !files.length && "border-border bg-card",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          void handleFiles(e.target.files)
          e.target.value = ""
        }}
      />

      <button
        type="button"
        data-slot="dropzone"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-(--radius-sm) py-6 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <UploadCloud01 className="size-6 text-muted-foreground" />
        <span className="text-sm text-foreground">
          Tarik file ke sini atau klik untuk memilih
        </span>
        {/* Batasan ditulis sebelum user mencoba — spec §3.6 */}
        <span className="text-xs text-muted-foreground">
          {accepted.map((a) => a.replace(".", "").toUpperCase()).join(", ")} ·
          maksimum {formatSize(maxSize)}
        </span>
      </button>

      {files.length > 0 && (
        <div data-slot="file-list" className="flex w-full flex-col gap-2">
          {files.map((f) => (
            <FileRow key={f.id} file={f} onRemove={remove} onCancel={remove} />
          ))}
        </div>
      )}

      {rejected && (
        <div
          data-slot="error-row"
          role="alert"
          className="flex w-full items-center gap-2 rounded-(--radius-sm) px-3 py-2"
        >
          <AlertTriangle className="size-4 shrink-0 text-destructive" />
          <span className="text-[13px] text-destructive">{rejected}</span>
        </div>
      )}
    </div>
  )
}

export { FileUploader }
