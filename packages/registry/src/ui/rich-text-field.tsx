"use client"

import * as React from "react"
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
} from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import {
  Bold01,
  Italic01,
  Dotpoints01,
  List,
  Link01,
} from "@untitledui/icons"

import { cn } from "@/lib/utils"

/**
 * CS-087 ← CMP-087 (BR-018) — Rich Text Document Field
 *
 * Sumber: AC-018-03 (format teks), AC-018-04 (insert hyperlink pada seleksi).
 * Library terkunci: @tiptap/react v3 (DL-DS-007) — headless, tanpa CSS bawaan,
 * sehingga seluruh tampilan memakai token `lorre/odama`.
 *
 * Di luar cakupan (spec §9): kolaborasi realtime, komentar, tabel, embed gambar,
 * lampiran berkas (CS-088), mention (CS-123), riwayat versi, export.
 */

type ToolbarButtonProps = {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  label: string
  children: React.ReactNode
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      data-slot="rich-text-toolbar-button"
      data-active={active ? "" : undefined}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-(--button-radius) transition-colors",
        "text-muted-foreground hover:bg-accent hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        active && "bg-accent text-foreground"
      )}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  const promptLink = React.useCallback(() => {
    const previous = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("URL", previous ?? "https://")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  // Tiptap v3 tidak me-render ulang pada tiap transaksi (`shouldRerenderOnTransaction`
  // default false), jadi state toolbar WAJIB dibaca lewat useEditorState — kalau tidak,
  // `disabled` dan state aktif terkunci di nilai saat mount.
  const s = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      link: editor.isActive("link"),
      // AC-018-04: insert-link hanya aktif saat ada blok teks terpilih
      hasSelection: !editor.state.selection.empty,
    }),
  })

  return (
    <div
      data-slot="rich-text-toolbar"
      role="toolbar"
      aria-label="Format teks"
      className="flex items-center gap-1 border-b border-border p-2"
    >
      <ToolbarButton
        label="Tebal"
        active={s.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold01 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Miring"
        active={s.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic01 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Daftar butir"
        active={s.bulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <Dotpoints01 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Daftar bernomor"
        active={s.orderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        {/* FLAG §14.6: tidak ada ikon daftar-bernomor di @untitledui/icons (1.179 ikon dicek).
            `List` dipakai sementara — menunggu keputusan human, JANGAN substitusi dari icon set lain. */}
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Sisipkan tautan"
        active={s.link}
        disabled={!s.hasSelection && !s.link}
        onClick={promptLink}
      >
        <Link01 className="size-4" />
      </ToolbarButton>
    </div>
  )
}

export type RichTextFieldProps = {
  /** Konten `rich_text_content` (HTML). */
  value?: string
  onChange?: (html: string) => void
  /** Mode baca — toolbar TIDAK dirender (bukan disabled), sesuai spec §3.6. */
  readOnly?: boolean
  /** `rendered` = tampil hasil dgn latar card; `read-only` = dibatasi izin, latar muted. */
  variant?: "rendered" | "read-only" 
  placeholder?: string
  className?: string
}

function RichTextField({
  value = "",
  onChange,
  readOnly = false,
  variant = "read-only",
  placeholder = "Tulis brief atau tech-spec di sini…",
  className,
}: RichTextFieldProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: !readOnly,
    content: value,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: false }),
      // WAJIB: StarterKit v3 TIDAK memuat Placeholder. Tanpa extension ini,
      // kelas `is-editor-empty` tidak pernah dipasang dan state `empty`
      // tampil kosong tanpa teks panduan — bug yang terlihat di preview.
      Placeholder.configure({ placeholder }),
    ],
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: {
        class: cn(
          "min-h-24 w-full px-3 py-3 text-sm text-foreground outline-none",
          // Tiptap headless — gaya blok diatur di sini, seluruhnya lewat token
          "[&_p]:leading-normal [&_p:not(:last-child)]:mb-2",
          "[&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-medium",
          "[&_h3]:mb-2 [&_h3]:text-sm [&_h3]:font-medium",
          "[&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5",
          "[&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
          "[&_.is-editor-empty:first-child::before]:pointer-events-none",
          "[&_.is-editor-empty:first-child::before]:float-left",
          "[&_.is-editor-empty:first-child::before]:h-0",
          "[&_.is-editor-empty:first-child::before]:text-neutral-6",
          "[&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]"
        ),
        "data-placeholder": placeholder,
      },
    },
  })

  React.useEffect(() => {
    if (editor && !editor.isDestroyed) editor.setEditable(!readOnly)
  }, [editor, readOnly])

  if (!editor) return null

  return (
    <div
      data-slot="rich-text-field"
      data-state={readOnly ? variant : undefined}
      className={cn(
        "w-full overflow-hidden rounded-(--input-radius) border border-input bg-card transition-colors",
        "focus-within:border-ring",
        readOnly && variant === "read-only" && "border-border bg-background",
        readOnly && variant === "rendered" && "border-input bg-card",
        className
      )}
    >
      {!readOnly && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}

export { RichTextField }
