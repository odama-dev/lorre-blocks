"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

import { cn } from "@lorre-blocks/registry/lib/utils"
import { Button } from "@lorre-blocks/registry/ui/button"

export function CopyButton({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Copy to clipboard"
      className={cn("h-7 w-7", className)}
      onClick={() => {
        void navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  )
}
