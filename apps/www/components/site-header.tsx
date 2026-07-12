import Link from "next/link"
import { Blocks } from "lucide-react"

import { SearchCommand } from "@www/components/search-command"
import { ThemeControls } from "@www/components/theme-controls"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Blocks className="h-5 w-5 text-primary" />
          Lorre Blocks
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/docs" className="transition-colors hover:text-foreground">
            Docs
          </Link>
          <Link
            href="/docs/components/accordion"
            className="transition-colors hover:text-foreground"
          >
            Components
          </Link>
          <Link href="/themes" className="transition-colors hover:text-foreground">
            Themes
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <SearchCommand />
          <ThemeControls />
          <a
            href="https://github.com/odama-dev/lorre-blocks"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  )
}
