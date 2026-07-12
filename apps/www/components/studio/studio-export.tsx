"use client"

import * as React from "react"
import type { ThemeDefinition } from "@lorre-blocks/tokens"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@lorre-blocks/registry/ui/tabs"
import { CLI_SNIPPET, studioCss } from "@www/lib/studio"
import { CopyButton } from "@www/components/copy-button"

/**
 * Export panel: the same definition three ways. The CSS tab is the full
 * generated theme block (paste into globals.css); the JSON tab is
 * lorre.theme.json; the CLI tab shows the agent path — both routes produce
 * byte-identical CSS because they run the same engine.
 */
export function StudioExport({ def }: { def: ThemeDefinition }) {
  const [css, setCss] = React.useState("")
  const json = React.useMemo(() => JSON.stringify(def, null, 2), [def])

  React.useEffect(() => {
    try {
      setCss(studioCss(def))
    } catch {
      // keep last good output while a control is mid-edit
    }
  }, [def])

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Export
      </h2>
      <Tabs defaultValue="css">
        <TabsList>
          <TabsTrigger value="css">CSS</TabsTrigger>
          <TabsTrigger value="json">lorre.theme.json</TabsTrigger>
          <TabsTrigger value="cli">CLI / agent</TabsTrigger>
        </TabsList>
        <TabsContent value="css">
          <ExportBlock
            text={css}
            hint="Paste between the lorre-blocks theme markers in your globals.css — or use the CLI tab and let it inject."
          />
        </TabsContent>
        <TabsContent value="json">
          <ExportBlock
            text={json}
            hint="Save as lorre.theme.json in your project root."
          />
        </TabsContent>
        <TabsContent value="cli">
          <div className="space-y-3">
            <ExportBlock
              text={CLI_SNIPPET}
              hint="With lorre.theme.json in place, one command generates and injects this exact CSS."
              rows="single"
            />
            <ExportBlock text={json} hint="The lorre.theme.json it reads:" />
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}

function ExportBlock({
  text,
  hint,
  rows = "tall",
}: {
  text: string
  hint: string
  rows?: "single" | "tall"
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">{hint}</p>
      <div className="group relative rounded-lg border bg-card">
        <CopyButton
          text={text}
          className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100"
        />
        <pre
          className={`overflow-x-auto p-4 font-mono text-xs leading-relaxed ${
            rows === "tall" ? "max-h-80 overflow-y-auto" : ""
          }`}
        >
          {text}
        </pre>
      </div>
    </div>
  )
}
