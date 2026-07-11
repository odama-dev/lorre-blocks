# Phase 6 — Full catalog expansion (shadcn · Radix · Magic UI · React Bits)

> Locked with Dimas 2026-07-12: port **the full catalogs** of shadcn/ui, Radix Themes,
> Magic UI and React Bits into the registry, each item classified by origin. Where
> libraries ship the same-looking thing, we keep **one canonical basic component** —
> no per-source duplicates. Align UI remains rewrite-only (license unclear, Phase 0
> decision — unchanged).

## Rules

### Classification

- Every port keeps its origin: `source: "shadcn" | "radix" | "magicui" | "reactbits"`,
  `license: "MIT"` (all four libraries are MIT). Rewrites and originals stay
  `source: "lorre"`. **Schema change: add `"reactbits"` to `RegistrySource`** (done in
  this PR).
- Category by nature, not by origin: interactive primitives → `component`; page
  sections → `block`; animation/effect pieces → `motion`.

### Dedupe — "looks the same → one general basic component"

One canonical item per UI concept. When two or more libraries ship essentially the
same component, port **one** implementation and absorb the others:

- Canonical-source precedence for overlapping *primitives*: **shadcn → radix →
  magicui → reactbits** (shadcn is already our base and is itself built on Radix).
- For overlapping *motion/effect* pieces where we already shipped a lorre original
  (marquee, count-up, fade-in, typewriter, shimmer, animated-gradient): **ours stays
  canonical**; absorb missing props/features rather than adding a twin.
- The absorbed names go into the canonical item's `tags` so `search` still finds them
  (e.g. count-up gets `number-ticker`; animated-gradient gets `gradient-text`;
  typewriter gets `typing-animation`, `word-rotate`; shimmer gets `animated-shiny-text`,
  `shiny-text`; fade-in gets `blur-fade` if we absorb blur as a prop).
- The dedupe ledger below is the working list; every expansion batch updates it.

### Dependency policy (locked)

- CSS / rAF / IntersectionObserver first — zero-dep ports whenever feasible (as in
  batches 7–8).
- **`motion` (framer-motion successor) is an allowed npm dependency** — it is the
  standard runtime for Magic UI and much of React Bits; declare it in the registry
  package.json (versioned-deps rule from the upgrade backlog applies automatically).
- Purpose-built small deps allowed per item when they are the ecosystem standard:
  `embla-carousel-react` (carousel), `recharts` (chart), `react-resizable-panels`
  (resizable), `cobe` (globe), `canvas-confetti` (confetti).
- **GSAP and WebGL (three/ogl) ports are gated to the final batch** and each item's
  description must carry a bundle-weight warning. If an effect is reimplementable on
  CSS/`motion` at acceptable fidelity, reimplement instead and keep `source` (it is
  still a port of their design).

### Process

Same as every batch since Phase 5: feature branch → PR (template checklists) → owner
merge. Demo per item (coverage test enforces), render smoke in CI, all 3 themes ×
light/dark visual pass per batch, reduced-motion for anything animated. Verify each
batch's inventory against the live upstream docs at implementation time — the lists
below are the planning snapshot (2026-07-12) and upstream catalogs move.

## Dedupe ledger (initial)

| Upstream item | Canonical Lorre item | Action |
|---|---|---|
| magicui marquee | `marquee` (lorre) | absorb `vertical` prop |
| magicui number-ticker | `count-up` (lorre) | tags += number-ticker |
| magicui animated-gradient-text | `animated-gradient` (lorre) | tags += gradient-text |
| magicui animated-shiny-text / reactbits shiny-text | `shimmer` (lorre) | tags += shiny-text |
| magicui typing-animation, word-rotate / reactbits rotating-text, text-type | `typewriter` (lorre) | tags += aliases |
| magicui blur-fade / reactbits fade-content | `fade-in` (lorre) | add `blur` prop, tags |
| reactbits count-up | `count-up` (lorre) | tags only |
| reactbits dock / magicui dock | one `dock` (source: magicui) | single port |
| reactbits carousel / magicui — | `carousel` (source: shadcn, embla) | single port |
| radix themes avatar/badge/card/checkbox/dialog/… | existing shadcn-ported set | no new items |
| radix themes code | `typography` (TypographyInlineCode) | deduped; batch 10 shipped `data-list` in its slot |
| radix themes blockquote | `typography` (TypographyBlockquote) | deduped; inline `quote` still ships (different element) |

## Batches (est. 6–10 items per session at proven cadence)

**Batch 9 — shadcn completion (~8, source: shadcn).** aspect-ratio, carousel (embla),
chart (recharts), data-table (tanstack table composition on our table), navigation-menu,
resizable, sidebar, typography. Closes out "all of shadcn".

**Batch 10 — Radix Themes uniques (~6, source: radix).** callout, kbd, spinner,
segmented-control, quote/blockquote, code. Only what the shadcn set does not already
cover — everything else in Radix Themes dedupes to existing items (see ledger).

**Batch 11 — Magic UI buttons + cards (~8, source: magicui).** shimmer-button,
rainbow-button, pulsating-button, ripple-button, interactive-hover-button, magic-card,
neon-gradient-card, shine-border.

**Batch 12 — Magic UI effects + layout (~10, source: magicui).** border-beam,
animated-beam, meteors, particles, confetti, orbiting-circles, avatar-circles,
bento-grid, animated-list, dock.

**Batch 13 — Magic UI text + media (~10, source: magicui).** text-reveal, box-reveal,
sparkles-text, morphing-text, aurora-text, scroll-progress, scroll-based-velocity,
hero-video-dialog, terminal, file-tree; device mocks (safari/iphone/android) if time.

**Batch 14 — React Bits text animations (~10, source: reactbits).** split-text,
blur-text, decrypted-text, scramble-text, ascii-text, circular-text, curved-loop,
variable-proximity, text-trail, glitch-text.

**Batch 15 — React Bits interactions + components (~10, source: reactbits).**
click-spark, magnet, star-border, spotlight-card, tilt-card / tilted-card, pixel-trail,
cursor effects (pick 2–3), stack, stepper, infinite-scroll, masonry.

**Batch 16 — Backgrounds, gated (~8, source: reactbits/magicui).** CSS-achievable
first: retro-grid, ripple, grid/dot patterns, aurora (CSS approximation), silk/waves
(evaluate); WebGL only where CSS cannot approximate, with bundle warnings: particles,
hyperspeed, globe (cobe). Each WebGL item needs an explicit go/no-go at batch time.

**Wrap-up.** Dedupe-ledger tag sweep, llms/docs refresh, retro on catalog coverage vs
upstream, decide maintenance cadence (upstream libraries keep shipping).

Registry lands at roughly **~130–140 items**. Feasibility knowns: motion/blocks
install paths, versioned-deps enforcement, demo-coverage gate, per-batch visual pass —
all already in place; nothing in this phase needs new infrastructure beyond the one-line
schema change.
