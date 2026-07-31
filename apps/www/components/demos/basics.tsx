"use client"

import { AlertCircle, Terminal } from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@lorre-blocks/registry/ui/alert"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@lorre-blocks/registry/ui/avatar"
import { Badge } from "@lorre-blocks/registry/ui/badge"
import { Button } from "@lorre-blocks/registry/ui/button"
import { Input } from "@lorre-blocks/registry/ui/input"
import { Label } from "@lorre-blocks/registry/ui/label"
import { Separator } from "@lorre-blocks/registry/ui/separator"
import { Skeleton } from "@lorre-blocks/registry/ui/skeleton"

export function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* `default` hitam lewat --button-background; `primary` biru lewat
          --primary. Dua peran berbeda — lihat DL-DS-009. */}
      <Button>Default</Button>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  )
}

export function BadgeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  )
}

export function InputDemo() {
  return (
    <div className="w-full max-w-sm space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="you@lorre.studio" />
    </div>
  )
}

export function LabelDemo() {
  return (
    <div className="w-full max-w-sm space-y-2">
      <Label htmlFor="project">Project name</Label>
      <Input id="project" placeholder="acme-dashboard" />
    </div>
  )
}

export function SeparatorDemo() {
  return (
    <div className="w-full max-w-sm">
      <p className="text-sm font-medium">Lorre Blocks</p>
      <p className="text-sm text-muted-foreground">Tokens and components.</p>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4 text-sm">
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>CLI</span>
        <Separator orientation="vertical" />
        <span>Registry</span>
      </div>
    </div>
  )
}

export function SkeletonDemo() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  )
}

export function AvatarDemo() {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src="https://github.com/vercel.png" alt="@vercel" />
        <AvatarFallback>VC</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>LB</AvatarFallback>
      </Avatar>
    </div>
  )
}

export function AlertDemo() {
  return (
    <div className="w-full max-w-xl space-y-4">
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components with the CLI.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Your session has expired.</AlertDescription>
      </Alert>
      <Alert variant="success">
        <AlertTitle>Deployed</AlertTitle>
        <AlertDescription>Your site is live.</AlertDescription>
      </Alert>
    </div>
  )
}
