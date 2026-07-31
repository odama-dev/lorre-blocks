"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Show Previous/Next pagination controls (default on for >10 rows). */
  pagination?: boolean
  /**
   * Fill the parent's height: rows scroll INSIDE the bordered area with a
   * sticky header, pagination stays pinned below. Parent chain must constrain
   * height (e.g. flex column with min-h-0). For table-only screens.
   */
  fillHeight?: boolean
  className?: string
}

/**
 * shadcn's data-table pattern packaged as one generic component: TanStack
 * Table v8 over our Table primitives with sorting, filtering and optional
 * pagination wired. For bespoke tables, copy this file and edit — it is a
 * starting point, exactly like upstream's guide.
 */
function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  fillHeight,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  // fillHeight: pageSize dinamis — muat baris sebanyak yang MENGISI tinggi
  // tersedia; sisanya pindah ke halaman berikutnya (bukan scroll internal).
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const [fitRows, setFitRows] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (!fillHeight) return
    const el = scrollerRef.current
    if (!el) return
    const measure = () => {
      const container = el.querySelector('[data-slot="table-container"]') ?? el
      const headH = el.querySelector("thead")?.getBoundingClientRect().height ?? 40
      const rowH = el.querySelector("tbody tr")?.getBoundingClientRect().height ?? 53
      setFitRows(Math.max(1, Math.floor((container.clientHeight - headH) / rowH)))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [fillHeight])

  const paginate =
    pagination ?? (fillHeight && fitRows !== null ? data.length > fitRows : data.length > 10)
  // Row-model pagination SELALU terpasang (menambah/melepasnya setelah instance
  // dibuat tidak andal di TanStack) — kontrol lewat pageSize: tanpa pagination,
  // pageSize = seluruh data.
  const pageSize = paginate ? (fillHeight && fitRows !== null ? fitRows : 10) : Math.max(data.length, 1)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
  })

  React.useEffect(() => {
    table.setPageSize(pageSize)
    const last = Math.max(table.getPageCount() - 1, 0)
    if (table.getState().pagination.pageIndex > last) table.setPageIndex(last)
  }, [pageSize, table])

  return (
    <div
      data-slot="data-table"
      className={cn("w-full", fillHeight && "flex h-full min-h-0 flex-col", className)}
    >
      <div
        ref={scrollerRef}
        className={cn(
          "overflow-hidden rounded-md border",
          // Scroller = table-container bawaan Table (sudah overflow-auto);
          // th sticky butuh bg + garis bawah sendiri karena border tr tidak ikut menempel
          fillHeight &&
            "min-h-0 flex-1 [&_[data-slot=table-container]]:h-full [&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10 [&_thead_th]:bg-background [&_thead_th]:shadow-[inset_0_-1px_0_0_var(--border)]"
        )}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {paginate && (
        <div className="flex shrink-0 items-center justify-end space-x-2 py-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

export { DataTable, type ColumnDef }
