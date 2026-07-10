import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { SiteHeader } from "@www/components/site-header"
import { ThemeScript } from "@www/components/theme-script"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: {
    default: "Lorre Blocks",
    template: "%s — Lorre Blocks",
  },
  description:
    "A design token + component registry with a shadcn-style CLI. Three themes, OKLCH scales, agent-first.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${inter.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}
