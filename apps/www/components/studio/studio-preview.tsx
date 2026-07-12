"use client"

import * as React from "react"
import type { ThemeDefinition } from "@lorre-blocks/tokens"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@lorre-blocks/registry/ui/alert-dialog"
import { Badge } from "@lorre-blocks/registry/ui/badge"
import { Button } from "@lorre-blocks/registry/ui/button"
import { Checkbox } from "@lorre-blocks/registry/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@lorre-blocks/registry/ui/dialog"
import { Label } from "@lorre-blocks/registry/ui/label"
import {
  RadioGroup,
  RadioGroupItem,
} from "@lorre-blocks/registry/ui/radio-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@lorre-blocks/registry/ui/tooltip"
import { Showcase } from "@www/components/showcase"

/**
 * The live gallery. Everything renders from registry source and re-themes
 * through the injected preview vars — including the portal-rendered overlays,
 * because the preview applies page-wide like the header theme picker.
 */
export function StudioPreview({ def }: { def: ThemeDefinition }) {
  return (
    <div className="space-y-8">
      <TypeSpecimen def={def} />

      <section className="space-y-3">
        <PreviewHeading>Buttons, badges & controls</PreviewHeading>
        <div className="flex flex-wrap items-center gap-3 rounded-lg border p-4">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Delete</Button>
          <Badge>Badge</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-6 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Checkbox id="studio-check" defaultChecked />
            <Label htmlFor="studio-check">Checkbox</Label>
          </div>
          <RadioGroup defaultValue="a" className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="a" id="studio-r-a" />
              <Label htmlFor="studio-r-a">One</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="b" id="studio-r-b" />
              <Label htmlFor="studio-r-b">Two</Label>
            </div>
          </RadioGroup>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Open dialog
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Panel tokens live here</DialogTitle>
                <DialogDescription>
                  This dialog&apos;s radius and padding come from the theme&apos;s
                  panel component tokens.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                Alert dialog
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  Same panel surface, destructive action emphasized.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm">
                  Hover me
                </Button>
              </TooltipTrigger>
              <TooltipContent>Tooltip tokens</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </section>

      <section className="space-y-3">
        <PreviewHeading>Composed</PreviewHeading>
        <Showcase />
      </section>
    </div>
  )
}

function PreviewHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </h2>
  )
}

/**
 * Heading sizes render through the type-scale vars directly (inline var()
 * styles) so ratio changes are visible even though `text-h*` utilities are
 * compiled at build time.
 */
function TypeSpecimen({ def }: { def: ThemeDefinition }) {
  const ratio = def.typography?.typeScale?.ratio ?? 1.25
  return (
    <section className="space-y-3">
      <PreviewHeading>Type scale · ratio {ratio}</PreviewHeading>
      <div className="space-y-1 rounded-lg border p-4">
        {(["h1", "h2", "h3", "h4"] as const).map((level) => (
          <p
            key={level}
            className="truncate font-semibold"
            style={{
              fontSize: `var(--text-${level})`,
              lineHeight: 1.2,
              fontFamily: "var(--font-display, var(--font-sans))",
            }}
          >
            The quick brown fox
          </p>
        ))}
        <p style={{ fontSize: "var(--text-body)" }} className="text-muted-foreground">
          Body — the quick brown fox jumps over the lazy dog.
        </p>
        <p
          style={{ fontSize: "var(--text-small)", fontFamily: "var(--font-mono)" }}
          className="text-muted-foreground"
        >
          small mono — 0123456789
        </p>
      </div>
    </section>
  )
}
