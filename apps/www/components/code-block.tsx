import { codeToHtml } from "shiki"

import { cn } from "@lorre-blocks/registry/lib/utils"
import { CopyButton } from "@www/components/copy-button"

/**
 * Server-rendered highlighted code. Dual-theme output; globals.css flips the
 * palette when `.dark` is on the root element.
 */
export async function CodeBlock({
  code,
  lang = "tsx",
  className,
}: {
  code: string
  lang?: string
  className?: string
}) {
  const html = await codeToHtml(code.trimEnd(), {
    lang,
    themes: { light: "github-light-default", dark: "github-dark-default" },
    defaultColor: false,
  })

  return (
    <div
      className={cn(
        "group relative border border-dashed bg-card",
        className
      )}
    >
      <CopyButton
        text={code.trimEnd()}
        className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
      />
      <div
        className="overflow-x-auto p-4 text-sm [&_pre]:bg-transparent!"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

/** One-line shell command with a copy button, e.g. the `lorre-blocks add` snippet. */
export function CommandSnippet({
  command,
  className,
}: {
  command: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border border-dashed bg-muted px-4 py-2.5",
        className
      )}
    >
      <code className="overflow-x-auto whitespace-nowrap font-mono text-sm">
        {command}
      </code>
      <CopyButton text={command} className="shrink-0" />
    </div>
  )
}
