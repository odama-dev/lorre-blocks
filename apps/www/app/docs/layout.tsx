import { DocsSidebar } from "@www/components/docs-sidebar"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex max-w-7xl border-x border-dashed">
      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-dashed px-4 py-10 md:block">
        <DocsSidebar />
      </aside>
      <div className="min-w-0 flex-1 px-6 py-10 md:px-10">{children}</div>
    </div>
  )
}
