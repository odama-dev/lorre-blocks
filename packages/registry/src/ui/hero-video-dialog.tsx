"use client"

import * as React from "react"
import { Play as PlayIcon } from "@untitledui/icons"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export interface HeroVideoDialogProps extends React.ComponentProps<"div"> {
  /** Embed URL (YouTube/Vimeo embed or a video file page). */
  videoSrc: string
  thumbnailSrc: string
  thumbnailAlt?: string
}

/**
 * Magic UI's HeroVideoDialog: a hero thumbnail with a play button that
 * opens the video in a modal. Composes the Lorre dialog (Radix focus trap,
 * esc/overlay close, panel-in animation) instead of shipping its own
 * overlay — no framer-motion.
 */
function HeroVideoDialog({
  videoSrc,
  thumbnailSrc,
  thumbnailAlt = "Video thumbnail",
  className,
  ...props
}: HeroVideoDialogProps) {
  return (
    <div data-slot="hero-video-dialog" className={cn("relative", className)} {...props}>
      <Dialog>
        <DialogTrigger className="group relative block w-full cursor-pointer overflow-hidden rounded-xl border">
          <img
            src={thumbnailSrc}
            alt={thumbnailAlt}
            className="w-full transition-transform duration-300 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
            <span className="flex size-16 items-center justify-center rounded-full bg-background/90 shadow-lg transition-transform duration-200 ease-out group-hover:scale-105 motion-reduce:transition-none">
              <PlayIcon className="size-7 fill-current text-primary" />
            </span>
          </span>
        </DialogTrigger>
        <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none [&>button]:text-white">
          <DialogTitle className="sr-only">{thumbnailAlt}</DialogTitle>
          <div className="aspect-video w-full overflow-hidden rounded-xl border bg-black">
            <iframe
              src={videoSrc}
              title={thumbnailAlt}
              className="size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { HeroVideoDialog }
