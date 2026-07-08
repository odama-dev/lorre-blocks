import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "lorre-blocks",
  description: "A shadcn-style component registry + CLI.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
