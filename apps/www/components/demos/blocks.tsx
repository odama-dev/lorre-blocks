import { Cta } from "@lorre-blocks/registry/blocks/cta"
import { Faq } from "@lorre-blocks/registry/blocks/faq"
import { Footer } from "@lorre-blocks/registry/blocks/footer"
import { Hero } from "@lorre-blocks/registry/blocks/hero"
import { Pricing } from "@lorre-blocks/registry/blocks/pricing"

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
