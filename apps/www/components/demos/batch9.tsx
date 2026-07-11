"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { HomeIcon, InboxIcon, SettingsIcon } from "lucide-react"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  TypographyBlockquote,
  TypographyH2,
  TypographyInlineCode,
  TypographyLead,
  TypographyP,
} from "@/components/ui/typography"

export function AspectRatioDemo() {
  return (
    <div className="w-full max-w-md">
      <AspectRatio ratio={16 / 9} className="rounded-lg bg-muted">
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          16 : 9
        </div>
      </AspectRatio>
    </div>
  )
}

export function TypographyDemo() {
  return (
    <div className="max-w-xl">
      <TypographyH2>Tokens, not overrides</TypographyH2>
      <TypographyLead>
        Every component reads the same semantic variables.
      </TypographyLead>
      <TypographyP>
        Swap the theme and prose like this re-colors itself — headings, body,{" "}
        <TypographyInlineCode>inline code</TypographyInlineCode> and all.
      </TypographyP>
      <TypographyBlockquote>
        "One token source, three personalities." — the Lorre thesis
      </TypographyBlockquote>
    </div>
  )
}

export function CarouselDemo() {
  return (
    <Carousel className="w-full max-w-xs" opts={{ loop: true }}>
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index}>
            <Card>
              <CardContent className="flex aspect-square items-center justify-center p-6">
                <span className="text-4xl font-semibold">{index + 1}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}

const chartData = [
  { month: "Jan", installs: 186, updates: 80 },
  { month: "Feb", installs: 305, updates: 200 },
  { month: "Mar", installs: 237, updates: 120 },
  { month: "Apr", installs: 73, updates: 190 },
  { month: "May", installs: 209, updates: 130 },
  { month: "Jun", installs: 214, updates: 140 },
]

const chartConfig = {
  installs: { label: "Installs", color: "var(--primary)" },
  updates: { label: "Updates", color: "var(--accent-8)" },
} satisfies ChartConfig

export function ChartDemo() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full max-w-lg">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="installs" fill="var(--color-installs)" radius={4} />
        <Bar dataKey="updates" fill="var(--color-updates)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}

interface Item {
  name: string
  type: string
  source: string
}

const tableRows: Item[] = [
  { name: "button", type: "ui", source: "shadcn" },
  { name: "navbar", type: "block", source: "lorre" },
  { name: "marquee", type: "motion", source: "lorre" },
  { name: "sidebar", type: "ui", source: "shadcn" },
]

const tableColumns: ColumnDef<Item>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "source", header: "Source" },
]

export function DataTableDemo() {
  return (
    <div className="w-full max-w-lg">
      <DataTable columns={tableColumns} data={tableRows} pagination={false} />
    </div>
  )
}

export function NavigationMenuDemo() {
  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Registry</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-64 gap-1 p-1">
              <li>
                <NavigationMenuLink href="/docs/components/button">
                  <span className="font-medium">Components</span>
                  <span className="text-muted-foreground">
                    42 primitives on Lorre tokens
                  </span>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/docs/blocks/hero">
                  <span className="font-medium">Blocks</span>
                  <span className="text-muted-foreground">
                    Full marketing-page sections
                  </span>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/docs" className={navigationMenuTriggerStyle()}>
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export function ResizableDemo() {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[160px] w-full max-w-lg rounded-lg border"
    >
      <ResizablePanel defaultSize={30}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="text-sm font-medium">Nav</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={70}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="text-sm font-medium">Content</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

const sidebarItems = [
  { title: "Home", icon: HomeIcon },
  { title: "Inbox", icon: InboxIcon },
  { title: "Settings", icon: SettingsIcon },
]

export function SidebarDemo() {
  return (
    <div className="h-[320px] w-full overflow-hidden rounded-lg border">
      <SidebarProvider defaultOpen className="min-h-0 h-full">
        <Sidebar collapsible="none" className="h-full">
          <SidebarHeader>
            <span className="px-2 text-sm font-semibold">Acme Inc</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Application</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton isActive={item.title === "Home"}>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SidebarTrigger />
            content area
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
