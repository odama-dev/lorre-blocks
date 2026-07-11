import * as React from "react"

import { cn } from "@/lib/utils"

export interface AvatarCircleItem {
  imageUrl: string
  profileUrl?: string
  alt?: string
}

/**
 * Magic UI's AvatarCircles: an overlapping avatar stack with a "+N" tail —
 * social proof for heroes and testimonial sections. Plain <img>/<a> so it
 * works in any React app; pass numPeople for the counter.
 */
function AvatarCircles({
  className,
  avatars,
  numPeople,
  ...props
}: React.ComponentProps<"div"> & {
  avatars: AvatarCircleItem[]
  numPeople?: number
}) {
  return (
    <div
      data-slot="avatar-circles"
      className={cn("z-10 flex -space-x-3 rtl:space-x-reverse", className)}
      {...props}
    >
      {avatars.map((avatar, index) => {
        const img = (
          <img
            key={index}
            src={avatar.imageUrl}
            alt={avatar.alt ?? `Avatar ${index + 1}`}
            width={40}
            height={40}
            className="size-10 rounded-full border-2 border-background object-cover"
          />
        )
        return avatar.profileUrl ? (
          <a
            key={index}
            href={avatar.profileUrl}
            target="_blank"
            rel="noreferrer"
            className="transition-transform hover:-translate-y-0.5 motion-reduce:transition-none"
          >
            {img}
          </a>
        ) : (
          img
        )
      })}
      {typeof numPeople === "number" && numPeople > 0 && (
        <span className="flex size-10 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground">
          +{numPeople}
        </span>
      )}
    </div>
  )
}

export { AvatarCircles }
