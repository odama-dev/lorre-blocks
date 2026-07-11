import { Blocks, Palette, Terminal, Wrench } from "lucide-react"

import { Cta } from "@lorre-blocks/registry/blocks/cta"
import { Faq } from "@lorre-blocks/registry/blocks/faq"
import { Features } from "@lorre-blocks/registry/blocks/features"
import { Footer } from "@lorre-blocks/registry/blocks/footer"
import { Hero } from "@lorre-blocks/registry/blocks/hero"
import { Navbar } from "@lorre-blocks/registry/blocks/navbar"
import { Pricing } from "@lorre-blocks/registry/blocks/pricing"
import { Stats } from "@lorre-blocks/registry/blocks/stats"
import { Testimonials } from "@lorre-blocks/registry/blocks/testimonials"

export function HeroDemo() {
  return (
    <Hero
      className="py-16 md:py-20"
      eyebrow="Now in alpha"
      title="Ship on-brand interfaces in minutes"
      description="A design token and component registry for Lorre projects. Pick a theme, add components with one command, and own every line of the code."
      actions={[
        { label: "Get started", href: "#" },
        { label: "View on GitHub", href: "#" },
      ]}
    />
  )
}

export function PricingDemo() {
  return (
    <Pricing
      className="py-12 md:py-16"
      title="Simple, honest pricing"
      description="Start free and scale when your team does. Every plan ships the full registry."
      tiers={[
        {
          name: "Hobby",
          price: "Free",
          description: "For side projects and evaluation.",
          features: ["All components", "3 themes", "Community support"],
          cta: { label: "Start for free", href: "#" },
        },
        {
          name: "Pro",
          price: "$29",
          period: "/month",
          description: "For product teams shipping to production.",
          features: [
            "Everything in Hobby",
            "Private registry",
            "Custom themes",
            "Priority support",
          ],
          cta: { label: "Get started", href: "#" },
          highlighted: true,
          badge: "Most popular",
        },
        {
          name: "Enterprise",
          price: "Custom",
          description: "For organizations with special requirements.",
          features: [
            "Everything in Pro",
            "SSO & audit logs",
            "Dedicated support",
            "Custom contracts",
          ],
          cta: { label: "Contact sales", href: "#" },
        },
      ]}
    />
  )
}

export function FaqDemo() {
  return (
    <Faq
      className="py-12 md:py-16"
      description="Everything you need to know about the registry and the CLI."
      items={[
        {
          question: "Do I own the code?",
          answer:
            "Yes. Components are copied into your project as plain source files — there is no runtime dependency on the registry.",
        },
        {
          question: "How do themes work?",
          answer:
            "A theme is a set of design token values. Swapping themes rewrites one generated CSS block in your global stylesheet and touches zero component files.",
        },
        {
          question: "Can I use it outside of Next.js?",
          answer:
            "Yes. Components target React 19 + Tailwind v4 and are framework-agnostic; the CLI is tested against Vite and Next.js apps.",
        },
        {
          question: "Is it agent-friendly?",
          answer:
            "Every CLI command supports --json with exactly one JSON document on stdout, and the docs are mirrored as markdown at /llms.txt for language models.",
        },
      ]}
    />
  )
}

export function CtaDemo() {
  return (
    <Cta
      className="py-12 md:py-16"
      title="Start building with Lorre Blocks"
      description="One command scaffolds your theme, tokens and components. Free while in alpha."
      actions={[
        { label: "Get started", href: "#" },
        { label: "Read the docs", href: "#" },
      ]}
    />
  )
}

export function FeaturesDemo() {
  return (
    <Features
      className="py-12 md:py-16"
      title="Everything you need to ship"
      description="A complete design system, distributed as source you own."
      items={[
        {
          title: "Design tokens",
          description:
            "12-step OKLCH scales generated from five seeds, with semantic aliases that make themes swappable.",
          icon: <Palette className="h-5 w-5" />,
        },
        {
          title: "Copy, don't install",
          description:
            "Components land in your repo as plain source files — no runtime dependency, no lock-in.",
          icon: <Blocks className="h-5 w-5" />,
        },
        {
          title: "Agent-first CLI",
          description:
            "Every command supports --json with exactly one document on stdout, built for automation.",
          icon: <Terminal className="h-5 w-5" />,
        },
        {
          title: "Sculpt, don't fork",
          description:
            "Adapt components with token overrides and variants instead of maintaining private copies.",
          icon: <Wrench className="h-5 w-5" />,
        },
      ]}
      columns={4}
    />
  )
}

export function TestimonialsDemo() {
  return (
    <Testimonials
      className="py-12 md:py-16"
      title="Loved by teams that ship"
      description="What people building with Lorre Blocks say."
      items={[
        {
          quote:
            "We swapped our whole dashboard to the utilitarian theme in one command. Zero component edits.",
          author: "Ayu Prameswari",
          role: "Design Engineer, Nimbus",
        },
        {
          quote:
            "The --json CLI is the first component registry our build agents can actually drive end to end.",
          author: "Marco Lindgren",
          role: "Platform Lead, Vektor",
        },
        {
          quote:
            "Owning the source without owning the maintenance burden is exactly the trade we wanted.",
          author: "Sari Wibowo",
          role: "Frontend Lead, Kanaya Studio",
        },
      ]}
    />
  )
}

export function StatsDemo() {
  return (
    <Stats
      className="py-12 md:py-16"
      title="Built to be adopted"
      items={[
        { value: "52", label: "Registry items" },
        { value: "3", label: "Themes", description: "basic, dreamy, utilitarian" },
        { value: "100%", label: "Source owned", description: "copied into your repo" },
        { value: "1", label: "Command to re-theme" },
      ]}
    />
  )
}

export function NavbarDemo() {
  return (
    <Navbar
      sticky={false}
      brand="Lorre Blocks"
      links={[
        { label: "Docs", href: "#" },
        { label: "Components", href: "#" },
        { label: "Blocks", href: "#" },
        { label: "Themes", href: "#" },
      ]}
      actions={[
        { label: "Sign in", href: "#" },
        { label: "Get started", href: "#" },
      ]}
    />
  )
}

export function FooterDemo() {
  return (
    <Footer
      brand="Lorre Blocks"
      description="A design token + component registry for Lorre projects."
      groups={[
        {
          title: "Product",
          links: [
            { label: "Components", href: "#" },
            { label: "Blocks", href: "#" },
            { label: "Themes", href: "#" },
          ],
        },
        {
          title: "Resources",
          links: [
            { label: "Documentation", href: "#" },
            { label: "CLI reference", href: "#" },
            { label: "llms.txt", href: "#" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "About", href: "#" },
            { label: "GitHub", href: "#" },
          ],
        },
      ]}
      copyright="© 2026 Lorre. All rights reserved."
      legalLinks={[
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
      ]}
    />
  )
}
