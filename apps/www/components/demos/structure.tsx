"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@lorre-blocks/registry/ui/accordion"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@lorre-blocks/registry/ui/breadcrumb"
import { Button } from "@lorre-blocks/registry/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@lorre-blocks/registry/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@lorre-blocks/registry/ui/collapsible"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@lorre-blocks/registry/ui/pagination"
import { ScrollArea } from "@lorre-blocks/registry/ui/scroll-area"
import { Separator } from "@lorre-blocks/registry/ui/separator"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lorre-blocks/registry/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@lorre-blocks/registry/ui/tabs"

export function AccordionDemo() {
  return (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It follows the WAI-ARIA disclosure pattern via Radix.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it themed?</AccordionTrigger>
        <AccordionContent>
          Every color, radius and duration comes from Lorre tokens.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export function TabsDemo() {
  return (
    <Tabs defaultValue="account" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="pt-3 text-sm text-muted-foreground">
        Manage your account settings here.
      </TabsContent>
      <TabsContent value="password" className="pt-3 text-sm text-muted-foreground">
        Change your password here.
      </TabsContent>
    </Tabs>
  )
}

export function CollapsibleDemo() {
  return (
    <Collapsible className="w-full max-w-sm space-y-2">
      <div className="flex items-center justify-between rounded-md border px-4 py-2">
        <span className="text-sm font-semibold">3 starred repos</span>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon">
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-2 text-sm">
          lorre-blocks/registry
        </div>
        <div className="rounded-md border px-4 py-2 text-sm">
          lorre-blocks/cli
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function CardDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Header, content and footer sections compose freely.
      </CardContent>
      <CardFooter>
        <Button className="w-full">Mark all as read</Button>
      </CardFooter>
    </Card>
  )
}

export function TableDemo() {
  const invoices = [
    ["INV001", "Paid", "$250.00"],
    ["INV002", "Pending", "$150.00"],
    ["INV003", "Unpaid", "$350.00"],
  ]
  return (
    <Table>
      <TableCaption>Recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map(([id, status, amount]) => (
          <TableRow key={id}>
            <TableCell className="font-medium">{id}</TableCell>
            <TableCell>{status}</TableCell>
            <TableCell className="text-right">{amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function BreadcrumbDemo() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/docs">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function ScrollAreaDemo() {
  const versions = Array.from({ length: 30 }, (_, i) => `v0.${30 - i}.0`)
  return (
    <ScrollArea className="h-56 w-52 rounded-md border">
      <div className="p-4">
        <h4 className="mb-3 text-sm font-semibold">Releases</h4>
        {versions.map((v) => (
          <React.Fragment key={v}>
            <div className="py-1.5 text-sm">{v}</div>
            <Separator />
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  )
}

export function PaginationDemo() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
