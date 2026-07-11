"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { FileText, LayoutTemplate, Search, SquareDashed } from "lucide-react"

import { registry } from "@lorre-blocks/registry/registry"
import { Button } from "@lorre-blocks/registry/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@lorre-blocks/registry/ui/command"

const GUIDE_PAGES = [
  { title: "Introduction", href: "/docs" },
  { title: "Theming", href: "/docs/theming" },
  { title: "CLI reference", href: "/docs/cli" },
]

const componentItems = registry
  .filter((item) => item.type === "registry:ui")
  .sort((a, b) => a.name.localeCompare(b.name))

const blockSearchItems = registry
  .filter((item) => item.type === "registry:block")
  .sort((a, b) => a.name.localeCompare(b.name))

export function SearchCommand() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((value) => !value)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const go = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-muted-foreground sm:w-56 sm:justify-start"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="max-sm:hidden">Search docs…</span>
        <kbd className="pointer-events-none ml-auto rounded border bg-muted px-1.5 font-mono text-[10px] font-medium max-sm:hidden">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Search docs">
        <CommandInput placeholder="Search components and guides…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Guides">
            {GUIDE_PAGES.map((page) => (
              <CommandItem key={page.href} onSelect={() => go(page.href)}>
                <FileText className="h-4 w-4" />
                {page.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Blocks">
            {blockSearchItems.map((item) => (
              <CommandItem
                key={item.name}
                keywords={item.tags}
                onSelect={() => go(`/docs/blocks/${item.name}`)}
              >
                <LayoutTemplate className="h-4 w-4" />
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Components">
            {componentItems.map((item) => (
              <CommandItem
                key={item.name}
                keywords={item.tags}
                onSelect={() => go(`/docs/components/${item.name}`)}
              >
                <SquareDashed className="h-4 w-4" />
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
