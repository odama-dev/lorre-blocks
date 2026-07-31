"use client"

import * as React from "react"

import { FileUploader } from "@lorre-blocks/registry/ui/file-uploader"
import {
  KanbanBoard,
  KanbanCard,
  KanbanColumn,
} from "@lorre-blocks/registry/ui/kanban-board"
import { LogoUploader } from "@lorre-blocks/registry/ui/logo-uploader"
import { RichTextField } from "@lorre-blocks/registry/ui/rich-text-field"
import {
  WidgetBuilderCanvas,
  type WidgetItem,
} from "@lorre-blocks/registry/ui/widget-builder-canvas"

export function KanbanBoardDemo() {
  return (
    <div className="w-full overflow-x-auto">
      <KanbanBoard>
        <KanbanColumn title="Lead" count={2}>
          <KanbanCard
            companyName="PT Maju Jaya"
            title="Integrasi pembayaran gateway"
            description="Validasi limit kredit per distributor."
            statusLabel="On Track"
            assignees={["LR", "AP"]}
          />
          <KanbanCard
            companyName="CV Sinar Abadi"
            title="Sinkronisasi stok gudang"
            statusLabel="On Track"
            assignees={["BN"]}
          />
        </KanbanColumn>
        <KanbanColumn title="Qualified" count={1}>
          <KanbanCard
            companyName="PT Nusantara Tbk"
            title="Audit trail approval"
            statusLabel="On Track"
            assignees={["SW"]}
          />
        </KanbanColumn>
        <KanbanColumn title="Won" count={0} state="empty" />
      </KanbanBoard>
    </div>
  )
}

export function RichTextFieldDemo() {
  const [value, setValue] = React.useState(
    '<p>Ruang lingkup <strong>integrasi</strong> gateway, dengan <a href="https://example.com">panduan</a>.</p><ul><li>Validasi limit kredit</li></ul>'
  )
  return (
    <div className="w-full max-w-xl">
      <RichTextField value={value} onChange={setValue} />
    </div>
  )
}

export function FileUploaderDemo() {
  const [files, setFiles] = React.useState([
    { id: "1", name: "proposal-q4.pdf", size: 842_000 },
    { id: "2", name: "kontrak-draft.docx", size: 1_240_000 },
  ])
  return (
    <div className="w-full max-w-xl">
      <FileUploader files={files} onFilesChange={setFiles} />
    </div>
  )
}

export function LogoUploaderDemo() {
  const [logo, setLogo] = React.useState<string | null>(null)
  return (
    <div className="flex items-start gap-10">
      {/* Kosong → inisial, bukan lingkaran kosong */}
      <LogoUploader
        companyName="PT Maju Jaya"
        value={logo}
        onChange={setLogo}
        onUpload={async () => "https://github.com/vercel.png"}
      />
      <LogoUploader
        companyName="CV Sinar Abadi"
        value="https://github.com/vercel.png"
      />
    </div>
  )
}

export function WidgetBuilderCanvasDemo() {
  const [widgets, setWidgets] = React.useState<WidgetItem[]>([
    { i: "w1", title: "Deal aktif", x: 0, y: 0, w: 4, h: 3, value: "128", caption: "+12% vs bulan lalu" },
    { i: "w2", title: "Nilai pipeline", x: 4, y: 0, w: 4, h: 3, value: "Rp 4,2 M", caption: "34 deal" },
  ])
  return (
    <div className="w-full">
      <WidgetBuilderCanvas
        widgets={widgets}
        onLayoutChange={setWidgets}
        onAddWidget={(source, placement) =>
          setWidgets((w) => [
            ...w,
            {
              i: `${source}-${w.length + 1}`,
              title: source,
              x: placement?.x ?? 0,
              y: placement?.y ?? Infinity,
              w: placement?.w ?? 4,
              h: placement?.h ?? 3,
            },
          ])
        }
        onDuplicateWidget={(id) =>
          setWidgets((w) => {
            const src = w.find((x) => x.i === id)
            return src ? [...w, { ...src, i: `${id}-copy`, y: Infinity }] : w
          })
        }
        onRemoveWidget={(id) => setWidgets((w) => w.filter((x) => x.i !== id))}
      />
    </div>
  )
}
