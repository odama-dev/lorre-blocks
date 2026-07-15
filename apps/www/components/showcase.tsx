"use client"

import * as React from "react"

import { Avatar, AvatarFallback } from "@lorre-blocks/registry/ui/avatar"
import { Badge } from "@lorre-blocks/registry/ui/badge"
import { Button } from "@lorre-blocks/registry/ui/button"
import { Calendar } from "@lorre-blocks/registry/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lorre-blocks/registry/ui/card"
import { Input } from "@lorre-blocks/registry/ui/input"
import { Label } from "@lorre-blocks/registry/ui/label"
import { Progress } from "@lorre-blocks/registry/ui/progress"
import { Slider } from "@lorre-blocks/registry/ui/slider"
import { Switch } from "@lorre-blocks/registry/ui/switch"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@lorre-blocks/registry/ui/tabs"

/**
 * Live component sampler on the landing page. Everything below is rendered
 * straight from registry source, so it always reflects the real components.
 */
export function Showcase() {
  const [usage, setUsage] = React.useState(64)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="rounded-none border-dashed shadow-none">
        <CardHeader>
          <CardTitle>Create project</CardTitle>
          <CardDescription>
            Ship a token-configured app in one command.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="acme-dashboard" />
          </div>
          <div className="flex items-center justify-between border border-dashed p-3">
            <div className="space-y-0.5">
              <Label htmlFor="tokens">Semantic tokens</Label>
              <p className="text-xs text-muted-foreground">
                bg-primary, ring-ring, text-muted-foreground…
              </p>
            </div>
            <Switch id="tokens" defaultChecked />
          </div>
          <Button className="w-full">Deploy</Button>
        </CardContent>
      </Card>

      <Card className="rounded-none border-dashed shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Storage
            <Badge variant="secondary">{usage}%</Badge>
          </CardTitle>
          <CardDescription>Drag to see progress track it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Progress value={usage} />
          <Slider
            value={[usage]}
            max={100}
            step={1}
            onValueChange={([value]) => setUsage(value)}
          />
          <Tabs defaultValue="team">
            <TabsList className="w-full">
              <TabsTrigger value="team" className="flex-1">
                Team
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex-1">
                Billing
              </TabsTrigger>
            </TabsList>
            <TabsContent value="team" className="pt-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>LB</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">Lorre Studio</p>
                  <p className="text-muted-foreground">3 members</p>
                </div>
                <Badge className="ml-auto">Pro</Badge>
              </div>
            </TabsContent>
            <TabsContent value="billing" className="pt-3">
              <p className="text-sm text-muted-foreground">
                Next invoice on August 1, 2026.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="rounded-none border-dashed shadow-none max-lg:hidden">
        <CardHeader>
          <CardTitle>Pick a date</CardTitle>
          <CardDescription>react-day-picker on Lorre tokens.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar mode="single" className="p-0" />
        </CardContent>
      </Card>
    </div>
  )
}
