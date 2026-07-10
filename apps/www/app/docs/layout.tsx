import { DocsSidebar } from "@www/components/docs-sidebar"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex max-w-7xl gap-10 px-6">
      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto py-10 md:block">
        <DocsSidebar />
      </aside>
      <div className="min-w-0 flex-1 py-10">{children}</div>
    </div>
  )
}
