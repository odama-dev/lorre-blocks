# Lorre Blocks — Progress Log

Running log, newest entry first. One entry per working session; record decisions, what
shipped, and what's next so any human or agent can pick up from here.

---

## 2026-07-12 — Phase 7 plan drafted + 7.1 tokens v2 shipped

**PR #31 owner-merged (Phase 6 fully complete).** New direction from Ilyas: make the
theme system generative à la the Radix Themes playground — humans tailor a design
system on a www **Theme Studio** page, agents write the same `lorre.theme.json` and
run one CLI command; **plus a dedicated `/icons` page** (multi-set browser, per-style
variants, hover-copy SVG/JSX — Untitled UI is the UX bar but its icons are
proprietary, so the catalog is lucide/radix/phosphor/heroicons). Plan doc:
`docs/phase-7-theme-studio.md` → **PR #32 (plan, merge = lock)**. Parity bar for the
whole phase: Studio-exported CSS ≡ CLI-injected CSS for the same theme JSON. Next
concrete deliverable per Ilyas: the two www pages (7.4 + 7.5), after the engine work.

**Shipped (branch `feat/phase7-tokens-v2` → PR #33): Phase 7.1 — token engine v2.**
- **Extracted the engine** to `packages/tokens` (`@lorre-blocks/tokens`, private,
  pure TS, zero node deps → browser-runnable for the Studio; CLI will bundle it via
  tsup in 7.3). `@lorre-blocks/registry/tokens` re-exports for back-compat;
  registry's `test` script moved with the suite.
- **Schema v2** (all optional → old themes unaffected): optional `secondary`
  ColorSeed scale (semantics auto-remap to `secondary-9`/`on-secondary` unless the
  chain mapped it explicitly — dreamy keeps its tinted surfaces);
  `typography.typeScale {base, ratio, fluid}` → fluid `--text-h1…h6/body/small`
  clamp() tokens + Tailwind `--text-*` keys (utilities `text-h1`… with paired line
  heights); `spacing.scaling` → `--spacing` (whole-layout density, Radix-style);
  per-component tokens for the locked key set (button/input/card/panel/badge/tabs/
  control/tooltip) emitted as `--<comp>-<key>` vars whose defaults mirror the ui
  source exactly (7.2 wires components onto them pixel-identically); `icons
  {set, style}` + `ICON_SETS` catalog (single source for /icons page, CLI flag,
  `/r/icons/index.json`).
- **`themeDefinitionSchema`** (zod, strict) — the shared `lorre.theme.json`
  validator for CLI/plan.json/Studio; per-set icon-style refinement.
- **`hexToSeed`/`hexToOklch`** — brand hex → OKLCH seed (inverse Ottosson).

**Verified:** tokens tests 42/42 · workspace 363/363 (www 253 render smokes prove
pixel-identity) · typecheck all ✓ · registry build deterministic, theme.css gains
only the new token groups.

**Next:** 7.2 wire component tokens into ui source → 7.3 CLI `theme create`/`show` +
plan.json inline theme + MCP `create_theme` → 7.4 `/themes` Studio + 7.5 `/icons`.

---

## 2026-07-13 (7) — Phase 6 wrap-up — PHASE 6 COMPLETE

**PR #30 owner-merged (batch 16 live).** Shipped (branch `feat/phase6-wrapup` →
PR #31): the closing sweep. (1) **Alias tag sweep** — every absorbed upstream name is
now a search tag on its canonical item: count-up+number-ticker, animated-gradient+
gradient-text/animated-gradient-text, typewriter+typing-animation/word-rotate/
rotating-text/text-type, shimmer+animated-shiny-text/shiny-text, fade-in+blur-fade/
fade-content, marquee+vertical. (2) **Last two ledger prop absorptions**: marquee
`vertical` prop (new `--animate-marquee-vertical` token) and fade-in `blur` prop.
(3) **Coverage retro** written into docs/phase-6-expansion.md — shadcn 100%, Radix
interactive-complete (presentational Box/Flex/Grid skipped by design), Magic UI
complete minus device mocks (open nice-to-have) and NO-GO WebGL, React Bits complete
by port-or-ruling. End state: **126 items, 5 sources, zero motion/GSAP/three deps,
one gated WebGL dep (cobe)**. (4) **Maintenance cadence decided: quarterly upstream
sweep, next due 2026-10** (diff catalogs vs ledger, port additions under the same
rules, revisit NO-GOs only on CSS-achievable upstream changes). llms/docs need no
hand-edits — all derive from the registry at prebuild.

**Verified:** registry build ✓ (126, tags in index.json) · tests **341/341** ✓.
Item count unchanged — this PR only touches tags, two motion props, one token, docs.

---

## 2026-07-13 (6) — Batch 16 (FINAL): backgrounds, gated — registry 126

**PR #29 owner-merged (batch 15 live). This closes the last porting batch of
Phase 6 — only the wrap-up (ledger tag sweep, llms/docs refresh, coverage retro)
remains.** Shipped (branch `feat/batch16-backgrounds` → PR), 8 items.

**WebGL gate rulings (recorded in the ledger):** GO — **globe** on `cobe`
(~5 kB, the one purpose-built WebGL dep the policy pre-approved; bundle note in
the description; colors resolved from live primary/muted tokens at mount via a
1px-canvas oklch→RGB trick, drag to spin, reduced motion stops auto-rotation).
GO as 2D reimplementations — **hyperspeed** (canvas starfield warp) and
**waves** (two-octave sine line field). NO-GO — particles-3d (2D `particles`
already canonical), silk + splash-cursor/fluid-glass (fluid/noise shaders, no
CSS fidelity), ascii-text + text-trail (three.js text effects; trail niche
covered by pixel-trail/blob-cursor).

**CSS items:** **retro-grid** (perspective plane + horizon mask, new
`--animate-retro-grid` token with a `--retro-grid-cell` var so cellSize stays
seamless), **ripple** (new `--animate-ripple-wave` token — name avoids the
existing button `--animate-ripple`), **aurora** (new `--animate-aurora` token;
accent-scale blobs so it re-themes; reduced motion keeps a static wash),
**dot-pattern** + **grid-pattern** (static SVG, currentColor = border token).

**Gotcha:** cobe v2 dropped `onRender` — drive rotation with your own rAF
calling `globe.update({ phi })` (v0.6-era snippets silently fail typecheck).

**Verified:** registry build ✓ (manifest **126**) · typecheck ✓ · tests
**341/341** (www 253: +8 render, +8 coverage) · www build ✓ (131 pages) · CLI
e2e: fresh consumer `add globe retro-grid aurora dot-pattern` → `cobe@^2.0.1`
emitted versioned, all 3 new tokens in consumer globals.css, strict `tsc` PASS ·
Playwright: 8 pages 200 + zero console errors, globe PAINTS AND ROTATES in real
WebGL (screenshot delta), hyperspeed/waves animate, both static under
reduced-motion, dreamy `--primary` + dark ✓.

**Next:** Phase 6 wrap-up — dedupe-ledger tag sweep (absorbed aliases into
canonical items' tags), llms/docs refresh, coverage retro vs upstream catalogs,
maintenance cadence decision.

---

## 2026-07-13 (5) — Batch 15: React Bits interactions + components — registry 118

**PR #28 owner-merged (batch 14 live).** Shipped (branch
`feat/batch15-reactbits-interactions` → PR), 10 items `source: "reactbits"` MIT —
**`motion` dep still unused** (GSAP/framer-motion upstreams reimplemented on
pointer events, rAF and CSS transitions). Motion (6): **click-spark** (new
`--animate-click-spark` token; rotation on a wrapper span so the keyframe's
transform can't clobber it; bursts GC on animationend), **magnet** (pointer-zone
pull + transition ease-back), **star-border** (new `--animate-star-border` token;
kept SEPARATE from border-beam/shine-border — three visually distinct border
effects, noted in descriptions), **pixel-trail** (2D canvas grid fade, primary
token color), **blob-cursor** (rAF chase with per-blob lag, loop sleeps when
settled), **infinite-scroll** (vertical item feed ×2 wrapped at the duplicate's
offsetTop — exact period, no seam jump; pause-on-hover; marquee stays the
horizontal canonical). UI (4): **tilted-card** (3D perspective tilt),
**stack** (pointer-capture drag deck, Enter cycles for keyboard/reduced-motion),
**stepper** (recomposed on Lorre Button — registryDependencies carries button
transitively, verified e2e), **masonry** (CSS columns, server-renderable).
**Dedupe:** reactbits spotlight-card ABSORBED into magic-card (precedence
magicui > reactbits; tags += spotlight-card) — ledger updated; splash-cursor/
fluid-glass logged as WebGL-gated for the batch-16 go/no-go alongside
ascii-text/text-trail.

**Verified:** registry build ✓ (manifest **118**) · typecheck ✓ · tests
**325/325** (www 237: +10 render, +10 coverage) · www build ✓ (123 pages) · CLI
e2e: fresh consumer `add stepper stack click-spark star-border masonry` →
button pulled transitively, both new tokens in consumer globals.css, strict
`tsc` PASS · Playwright: 10 pages 200 + zero console errors, click spawns 8
sparks, magnet translates on hover, infinite-scroll drifts (and is static under
reduced motion), tilted-card sets rotateX, stepper advances with check mark,
stack drag AND reduced-motion Enter both cycle basic→dreamy, utilitarian
`--primary` oklch(0.27 0.015 240) + dark ✓.

**Next:** Batch 16 (final) — backgrounds, gated: CSS-first (retro-grid, ripple,
grid/dot patterns, aurora approximation, silk/waves evaluate), then explicit
go/no-go per WebGL candidate (particles-3d, hyperspeed, globe/cobe, ascii-text,
text-trail, splash-cursor). Then the wrap-up (ledger tag sweep, llms/docs
refresh, coverage retro).

---

## 2026-07-13 (4) — Batch 14: React Bits text animations — registry 108

**PR #27 owner-merged (batch 13 live).** Shipped (branch `feat/batch14-reactbits-text`
→ PR), 8 items — the **first `source: "reactbits"`** entries (schema slot from PR #22
finally used; manifest sources now lists all five). All are CSS/rAF/IO reimplementations
of GSAP/framer-motion upstreams per the locked dependency policy — **`motion` dep still
unused**: **split-text** + **blur-text** (IO + staggered CSS transitions; per-unit
spans aria-hidden, container carries aria-label), **decrypted-text** (JS timer locks
chars left→right on first view; SSR renders the finished string), **scramble-text**
(pointer-radius churn, 1ch-locked cells so layout never shifts), **circular-text**
(pure CSS ring on Tailwind's built-in spin — server-renderable), **curved-loop** (SVG
textPath marquee, one rAF slides startOffset; **jsdom guard: getComputedTextLength
missing → bail**, caught by the render smoke suite), **variable-proximity** (per-char
font-variation-settings 'wght'; needs a variable font, degrades to static),
**glitch-text** (new `--animate-glitch` token — stepped clip-path slices; chromatic
edges from danger/accent scales so it re-themes). **ascii-text + text-trail DEFERRED
to batch 16** — both are three.js/WebGL upstream, gated per the Phase 6 dependency
policy (each needs an explicit go/no-go at batch time).

**Verified:** registry build ✓ (manifest **108**, sources +reactbits) · typecheck ✓ ·
tests **305/305** (www 217: +8 render, +8 coverage) · www build ✓ (113 pages) · CLI
e2e vs local registry: fresh consumer `add split-text glitch-text scramble-text
curved-loop` → strict `tsc` PASS, `lorre-glitch` keyframes injected into consumer
globals.css by init · Playwright: 8 pages 200 + zero console errors, scramble churns
under a pointer sweep, variable-proximity sets 'wght' 846 mid-hover, curved-loop
startOffset drifts, decrypted settles to the exact string, dreamy `--primary`
oklch(0.62 0.2 292) + dark ✓, reduced-motion renders plain text at opacity 1.

**Next:** Batch 15 — React Bits interactions + components (click-spark, magnet,
star-border, spotlight-card, tilted-card, pixel-trail, cursor effects ×2–3, stack,
stepper, infinite-scroll, masonry), then gated backgrounds (batch 16, incl. the
deferred ascii-text/text-trail go/no-go).

---

## 2026-07-13 (3) — Batch 13: Magic UI text + media — registry 100

**PR #26 owner-merged (batch 12 live).** Shipped (branch `feat/batch13-magicui-text` →
PR), 10 items, all `source: "magicui"` MIT — **the `motion` dep is STILL unused**, every
port is CSS/rAF/IntersectionObserver: **text-reveal** (scroll-scrubbed sticky section,
rAF-throttled scroll listener sets per-word opacity), **box-reveal** (IO + CSS
transitions; panel hidden entirely under reduced motion), **sparkles-text** (new
`--animate-sparkle` token; **index-seeded positions, SSR-safe**), **morphing-text**
(blur crossfade on stacked spans cycled by a timer — no SVG filter), **aurora-text**
(**reuses `--animate-gradient`** — multi-stop accent-scale drift + blurred glow copy;
animated-gradient stays the simple two-stop canonical), **scroll-progress** (rAF scroll
listener scaling a fixed gradient bar; stays on under reduced motion — it only mirrors
the user's own scrolling), **scroll-based-velocity** (one rAF loop, content ×4 wrapped
modulo), **hero-video-dialog** (**composes the Lorre dialog** — registryDependencies
carries the transitive `dialog` add, verified e2e), **terminal** (Terminal +
TypingAnimation + AnimatedSpan, delay-scheduled; reduced motion shows the full
transcript), **file-tree** (Tree/Folder/File, local toggle state, native buttons with
aria-expanded). 7 motion + 3 ui. **Device mocks (safari/iphone/android) skipped** —
"if time" per plan; fold into a later batch if wanted. No new npm deps.

**Verified:** registry build ✓ (manifest **100**, all magicui) · typecheck ✓ · tests
**289/289** (www 201: +10 render, +10 coverage) · www build ✓ (105 pages) · CLI e2e
vs local registry: `add hero-video-dialog terminal file-tree sparkles-text
scroll-based-velocity` → dialog resolved transitively, versioned deps, consumer strict
`tsc` PASS · Playwright: 10 docs pages 200 + zero console errors, dialog opens iframe,
file-tree toggles, dreamy `--primary` oklch(0.62 0.2 292) + dark ✓, reduced-motion
terminal renders full transcript instantly.

**Next:** Batch 14 — React Bits text animations (split-text, blur-text, decrypted-text,
scramble-text, ascii-text, circular-text, curved-loop, variable-proximity, text-trail,
glitch-text) — first `source: "reactbits"` items.

---

## 2026-07-13 (2) — Batch 12: Magic UI effects + layout — registry 90

**PRs #24 + #25 owner-merged (batches 10–11 live).** Shipped (branch
`feat/batch12-magicui-effects` → PR), 10 items, all `source: "magicui"` MIT — **the
`motion` dep is STILL unused**; the two hard cases fell to platform primitives:
**animated-beam** (refs + ResizeObserver compute the path, the traveling pulse is an
**SVG SMIL gradient** — no JS animation loop) and **dock** (magnification = linear
distance falloff + CSS transition instead of springs). Rest: **border-beam** (CSS
`offset-path: rect(...)` around the border ring — new `--animate-border-beam` token),
**meteors** (new `--animate-meteor` token; **index-seeded positions, no Math.random →
SSR-safe**), **particles** (rAF canvas, pointer-attract, foreground-token color; static
field under reduced motion), **confetti** (first canvas-confetti dep: ConfettiButton +
imperative fireConfetti, skipped under reduced motion), **orbiting-circles** (spin +
counter-rotation), **animated-list** (tw-animate-css enter utilities),
**bento-grid** (background-slot cards, hover CTA), **avatar-circles**, **dock**.
7 motion + 3 ui. New deps: canvas-confetti + @types (registry only — demos import
components, not the lib, so www needed nothing).

**Verified:** registry build ✓ (90, manifest confirmed) · typecheck ✓ · tests
**269/269** (www 181: +10 render, +10 coverage) · www build ✓ (95 pages) · CLI e2e:
`add confetti dock bento-grid` → canvas-confetti + @types in npmDependencies, consumer
strict `tsc` PASS.

**Next:** Batch 13 — Magic UI text + media (text-reveal, box-reveal, sparkles-text,
morphing-text, aurora-text, scroll-progress, hero-video-dialog, terminal, file-tree,
device mocks if time).

---

## 2026-07-13 — Batch 11: Magic UI buttons + cards — registry 80

**Shipped (branch `feat/batch11-magicui-buttons`, stacked on batch 10 → PR; merge #24
first):** first **`source: "magicui"`** items. **The `motion` npm dep stayed deferred** —
all eight reimplement at full fidelity on CSS/React (upstream only uses framer-motion in
magic-card, replaced by pointer-tracked CSS vars): **shimmer-button** (orbiting streak =
rotating conic gradient, Tailwind's built-in spin), **rainbow-button** (the "rainbow" is
the theme's accent/success/warning/danger 9-steps — re-themes instead of hardcoding
hues), **pulsating-button** (built-in ping), **ripple-button** (click ripple via new
`--animate-ripple` token; ripples GC on animationend), **interactive-hover-button**
(dot floods button, label slides out/returns with arrow — pure group transitions),
**magic-card** (pointer-following spotlight: border tint + accent-3 wash),
**neon-gradient-card** (drifting accent gradient + blurred glow),
**shine-border** (`registry:motion` — border-ring shine via mask-composite exclude).
All honor motion-reduce. One new keyframe/token (`lorre-ripple`).

**Gotchas:** (1) node-script append to registry.ts silently no-opped — the file is CRLF
and the `\n`-based regex didn't match; entries landed via a proper Edit. Lesson: after
any scripted file mutation, verify the artifact (manifest itemCount), not the script's
own echo. (2) www demos must import motion items via `@lorre-blocks/registry/motion/*`
(the `@/components/motion/*` alias doesn't exist in www's tsconfig/vitest).

**Verified:** registry build ✓ (80) · typecheck ✓ · tests **249/249** (www 161: +8
render, +8 coverage) · www build ✓ (85 pages) · manifest itemCount 80 confirmed. CLI e2e
skipped — no new deps/routing (single-file items on existing paths).

**Next:** Batch 12 — Magic UI effects + layout (border-beam, animated-beam, meteors,
particles, confetti, orbiting-circles, avatar-circles, bento-grid, animated-list, dock).
confetti needs canvas-confetti; dock may finally need `motion`.

---

## 2026-07-12 (10) — Batch 10: Radix Themes uniques — registry 72

**PRs #22 (Phase 6 plan) + #23 (batch 9) owner-merged.** Shipped (branch
`feat/batch10-radix` → PR): the **first `source: "radix"` items** — Radix Themes
components the shadcn set doesn't cover: **callout** (soft tinted note straight off the
scale steps `*-3`/`*-11`, info/success/warning/danger — first component to use scale-step
utilities directly), **kbd**, **spinner** (8-blade, pure CSS on the existing fade
keyframe, reduced-motion slows to a pulse), **segmented-control** (Radix ToggleGroup
single-select, selection always required), **quote** (inline `<q>`), **data-list**
(semantic `<dl>` label/value pairs). Dedupe rule applied: Radix `code` and `blockquote`
collapse into batch 9's typography (ledger updated) — data-list took code's slot.
Zero new npm deps (toggle-group primitive already present). TS gotcha: after `Omit` on
Radix ToggleGroup's props union the discriminant is lost — type against
`ToggleGroupSingleProps` instead of `ComponentProps<typeof Root>`.

**Verified:** registry build ✓ (72) · typecheck ✓ (3 pkgs) · tests **241/241** (www 145:
+6 render, +6 coverage) · www build ✓ (77 pages) · CLI e2e skipped this batch — no new
routing paths or npm deps (all six are single-file ui items over existing
infrastructure); per-theme eyeball rides the post-merge deploy.

**Next:** Batch 11 — Magic UI buttons + cards (shimmer-button, rainbow-button,
pulsating-button, ripple-button, interactive-hover-button, magic-card,
neon-gradient-card, shine-border) — first `motion` npm dep decision point.

---

## 2026-07-12 (9) — Batch 9: shadcn completion (Phase 6 opener) — registry 66

**Shipped (branch `feat/batch9-shadcn-completion`, stacked on the Phase 6 plan branch →
PR):** the 8 items that complete "all of shadcn", all `source: "shadcn"` MIT:
**aspect-ratio**, **typography** (their style guide as components), **carousel** (embla),
**chart** (recharts 2.x wrapper: config-driven `--color-<key>` vars, themed
tooltip/legend), **data-table** (the upstream *pattern* packaged as one generic TanStack
v8 component over our table — copy-and-specialize), **navigation-menu**, **resizable**
(react-resizable-panels), **sidebar** — the big one, and the **first multi-file item**:
`ui/sidebar.tsx` + `hooks/use-mobile.ts` (`registry:hook` → consumer `hooks/`, a path
mapped since Phase 0 but never exercised). Design decision: shadcn's `--sidebar-*` token
family is **not** adopted — sidebar is rewired onto existing Lorre semantics (muted
surface, accent hover, standard border/ring), keeping the token surface small. New
registry npm deps: embla-carousel-react, recharts, react-resizable-panels,
@tanstack/react-table, @radix-ui/react-{aspect-ratio,navigation-menu}. www needed
recharts as its own dep (demos import it directly; registry-transitive deps don't
resolve under pnpm strict layout).

**Verified:** registry build ✓ (66, deterministic) · typecheck ✓ · tests **229/229**
(www 133 — 8 new render + 8 coverage) · www build ✓ (71 pages) · CLI e2e vs local
registry: `add sidebar data-table carousel` resolved the full 11-item chain, **hook file
landed in `hooks/use-mobile.ts`**, versioned npm deps correct, consumer strict `tsc`
PASS. Per-theme browser pass rides the standard post-merge eyeball.

**Next:** Batch 10 — Radix Themes uniques (callout, kbd, spinner, segmented-control,
quote, code).

---

## 2026-07-12 (8) — Phase 6 locked: full catalog expansion (shadcn · Radix · Magic UI · React Bits)

**PR #21 owner-merged; batch 8 verified live** (manifest 58, pages 200) **and the
deferred visual pass completed**: correct animation tokens on all three, typewriter
cycles words, dreamy re-themes the gradient violet, reduced-motion disables everything,
zero console errors. `lorre-blocks-mcp` 0.1.0 confirmed live on npm.

**Planning session (Dimas): Phase 6 locked** → [`phase-6-expansion.md`](./phase-6-expansion.md).
Port the complete catalogs of shadcn/ui, Radix Themes, Magic UI and React Bits.
Decisions: every port classified by origin (`source` + MIT); **same-looking components
dedupe to one canonical basic item** (precedence shadcn → radix → magicui → reactbits;
existing lorre motion originals stay canonical; absorbed names become search tags —
ledger in the doc); `motion` npm dep allowed; GSAP/WebGL gated to the final batch with
bundle warnings; Align UI stays rewrite-only. Batches 9–16 sketched (~130–140 items
end state). Schema prep in the same PR: `"reactbits"` added to `RegistrySource`
(schema.ts + build zod enum + CLI --source help).

**Next:** Batch 9 — shadcn completion (aspect-ratio, carousel, chart, data-table,
navigation-menu, resizable, sidebar, typography).

---

## 2026-07-12 (7) — Batch 8 motion: typewriter, shimmer, animated-gradient — registry 58

**PR #19 owner-merged (MCP server).** Shipped (branch `feat/batch8-motion` → PR #21),
same conventions as batch 7: **typewriter** (word cycler, caret via the existing
caret-blink token; reduced-motion renders the first word statically), **shimmer**
(pure-CSS text sweep, new `--animate-shimmer` token; motion-reduce → plain muted text),
**animated-gradient** (drifting accent-scale gradient text, new `--animate-gradient`
token; re-themes automatically). Two new keyframes/tokens in build-css.ts; www side is
just 3 demos + map entries — everything else registry-derived.

**Verified (lean run — session usage budget):** registry build ✓ (58) · typecheck ✓ ·
tests **205/205** (www 117 — render smoke + demo coverage picked the new items up
automatically) · www build ✓ (63 pages). **Deferred: the Playwright 3-themes ×
light/dark visual pass** — eyeball the three docs pages after the deploy.

**Next:** batch 8 visual pass, or a fresh planning session (all planned phases 0–5 +
4.x are complete).

---

## 2026-07-12 (6) — Phase 4.3: MCP server (`lorre-blocks-mcp` 0.1.0 queued)

**PRs #17 (CLI 0.7.0 → npm) and #18 (Phase 5 wrap-up) owner-merged — Phase 5 closed.**

**Shipped (branch `feat/mcp-server` → PR): new `packages/mcp`, published as
`lorre-blocks-mcp`** (unscoped — PLAN said `@lorre-blocks/mcp`, but the npm scope is
unclaimed/unverified and the unscoped name is guaranteed publishable with the existing
token; mirrors the CLI's name). Stdio MCP server on the official SDK (`McpServer` +
`registerTool`, zod v3 per SDK requirement). **Design: every tool is one spawn of the
lorre-blocks CLI with `--json`** — the CLI stays the single contract, so MCP-driven and
CLI-driven agents behave identically and the server needs no registry/business logic of
its own. CLI binary resolved via `require.resolve("lorre-blocks/package.json")` + bin
field (workspace copy in dev, the dependency after npm install). Tools: `search_registry`,
`get_component` (always `--files`), `add_component` (needs projectDir; init'ed project),
`apply_theme`, `list_themes`. `{ok:false}` docs map to MCP `isError`. Found + worked
around a CLI inconsistency: `theme list` is the only command without a DEFAULT_REGISTRY
fallback (it demands components.json or --registry) — the MCP layer injects the default
registry URL itself rather than forcing a CLI patch release.

**Wiring:** root `build`/`release` scripts + CI gain build:mcp; changeset minor → 0.1.0;
package README with `claude mcp add` / Claude Desktop setup; lorre.md monorepo line and
llms CLI_MD gained an MCP section.

**Verified:** typecheck ✓ (3 pkgs) · tests 199/199 (mcp 7: arg builders + bin resolution)
✓ · builds ✓ · **e2e over real MCP stdio** (SDK Client ↔ spawned server): `tools/list`
returns all 5; `search_registry("logo cloud", motion)` → marquee; `get_component(fade-in)`
returns full file contents; `list_themes` → basic/dreamy/utilitarian; unknown component →
`isError` with the CLI's `{ok:false}` payload; against a fresh init'ed consumer:
`add_component(badge, marquee)` wrote both files, `apply_theme(utilitarian)` swapped
globals.css, bogus theme → `isError`.

**Roadmap state: Phases 0–5 + 4.x all complete.** What remains is continuous Phase 2
porting (motion candidates: typewriter, shimmer, animated-gradient) and whatever the next
planning session locks.

---

## 2026-07-12 (5) — Phase 5 complete: registry CDN caching + agent PR workflow

**PR #16 owner-merged (`update` command); PR #17 "Version Packages" open — owner merge
publishes CLI 0.7.0.**

**Shipped (branch `feat/phase5-wrapup` → PR), closing the last two Phase 5 bullets:**
- **CDN caching for registry JSON** (`apps/www/next.config.mjs` `headers()`): `/r/:path*`
  → `Cache-Control: public, max-age=300, s-maxage=31536000, stale-while-revalidate=86400`
  + `Access-Control-Allow-Origin: *` (themes/tokens are public data — playgrounds can
  fetch them cross-origin). Same cache policy on `llms.txt`/`llms-full.txt`. Rationale:
  Vercel's edge cache is deployment-scoped, so the year-long `s-maxage` busts on every
  deploy; the short client `max-age` keeps browsers fresh; the CLI is a fresh process and
  never caches. Docs site was already fully static (60 prerendered pages) — nothing to do.
- **Agent-adds-a-component workflow**: `.github/PULL_REQUEST_TEMPLATE.md` with a
  registry-item checklist that mirrors the CI gates (build validation, drift guard, demo
  coverage, 3-themes check, reduced-motion) and a CLI checklist (changeset, --json
  contract, version string). `lorre.md` refreshed: add-item recipe now says *demo, not
  docs page* (registry-driven pages + coverage test), release flow is PR-only for
  everything (direct master pushes are no longer used), CLI command list includes
  update/plan/apply + lorre.lock, and a Motion section joined "Current registry contents".

**Verified:** www build ✓ (60 pages) · headers curl-checked against `next start`:
`/r/button.json` and `/r/themes/dreamy.json` carry the exact policy + CORS, `llms.txt`
carries the cache policy, `/docs` control page is untouched. Gotcha reconfirmed: stopping
the `next start` background task orphans the child on the port — kill by PID before
re-serving, else you probe the stale build.

**Phase 5 is complete.** Remaining roadmap: Phase 4.3 MCP server (stretch) and continuous
Phase 2 porting (motion candidates: typewriter, shimmer, animated-gradient).

---

## 2026-07-12 (4) — `update` command: lock-aware upstream pull (CLI 0.7.0 queued)

**PRs #14 (CLI 0.6.0 → npm, verified `latest`) and #15 (CI hardening) owner-merged.**

**Shipped (branch `feat/cli-update` → PR): `lorre-blocks update [names...] [--force]`.**
New `utils/update.ts` — `decideUpdate(local, registryContent, lockedHash, force)` pure
policy function on top of `classifyChange`: up-to-date → keep · upstream → write ·
local → keep (registry unchanged; the user's customization is not a problem to fix) ·
both/unknown/missing(deleted) → skip with a --force hint, write under `--force`.
`commands/update.ts`: no-arg updates everything in `lorre.lock` (fails with guidance when
no lock); items resolved via `resolveTree`, so a **new registry dependency introduced by
an update is added automatically** (files written only if absent) and its npm deps
installed; npm deps installed only for items actually touched; lock updated per write;
**stale/missing lock hashes self-heal** when a file's content matches the registry.
Changeset minor → **0.7.0**. www docs caught up in the same branch: CLI page rows for
update + lock-aware diff, llms CLI_MD gains a `## lorre.lock` section (clears the
standing 0.6.0 docs follow-up).

**Verified:** typecheck ✓ · CLI tests 61/61 (+6 decideUpdate matrix) ✓ · root tests
192/192 ✓ · www build ✓ · e2e against a mutable local registry: clean install → update is
a no-op; upstream-mutated button (+ new dep avatar) → button rewritten, **avatar
auto-added with its npm deps**; locally-edited badge → kept intact; diverged card →
skipped, `--force` overwrites; deleted button.tsx → skipped, `--force` restores;
post-update no-arg diff shows only badge `local`, avatar tracked; no-lock guard exits 1
with guidance; consumer strict `tsc` PASS.

**Next:** remaining Phase 5 (CDN caching for registry JSON, agent-adds-a-component
workflow) or Phase 4.3 MCP server.

---

## 2026-07-12 (3) — Phase 5 continued: CI hardening (render smoke tests, audit, drift guard)

**PR #13 owner-merged (lorre.lock); PR #14 "Version Packages" open — owner merge publishes
CLI 0.6.0.**

**Shipped (branch `feat/ci-hardening` → PR):**
- **Render smoke tests for every registry item with a docs demo** — new www vitest setup
  (jsdom + @testing-library/react + @vitejs/plugin-react; `esbuild.jsx` is ignored under
  Vite 8/rolldown, the plugin is required). `test/demos.test.tsx` renders all 54 demos
  (42 ui + 9 blocks + 3 motion) and a **coverage suite fails if any registry
  ui/block/motion item lacks a demo** — a new batch can't forget one. jsdom shims in
  `test/setup.ts`: IntersectionObserver, ResizeObserver, matchMedia, Radix pointer-capture.
  www gains a `test` script, so root `pnpm test` (and CI) picks it up automatically —
  186 tests total (cli 55, registry 20, www 111).
- **CI (`ci.yml`):** after `build:registry`, `git diff --exit-code` catches
  token-changed-without-rebuild drift and non-determinism (theme.css is tracked, generated);
  `pnpm audit --audit-level high` gate (repo currently has only 1 low + 1 moderate, so the
  gate is green and non-noisy).

**Verified locally in CI order:** registry build ✓ · theme.css drift 0 ✓ · audit ✓ ·
typecheck ✓ · 186/186 ✓ · CLI build ✓ · www build ✓ (test files are inside www's tsconfig
include, so `next build` typechecks them — confirmed clean).

**Remaining Phase 5:** immutable/CDN caching for registry JSON, `lorre.lock`-aware CLI
update flows, agent-adds-a-component workflow (PR template + auto-changeset). Phase 4.3
MCP server still the stretch goal.

---

## 2026-07-12 (2) — Phase 5 started: lorre.lock + attributed diff (CLI 0.6.0 queued)

**PR #12 owner-merged 17:03Z** (Phase 3.3 landing; production check pending next deploy
cycle — verify with a cache-busting param).

**Shipped: `lorre.lock`** (first Phase 5 item). New `src/utils/lock.ts`: schema v1 —
registry URL + per item `{ type, checksum (registry-declared at install), files: { posix
rel path → sha256 of content as written, post import-rewrite } }`; deterministic writes
(sorted keys). `init` (utils), `add` and `apply` merge into it — only items with files
actually written this run are touched, skipped files keep the hash of the install that
wrote them. **`diff` is now accurate:** for a modified file it compares local + current
registry content against the locked hash and reports `cause` — `local` (you edited),
`upstream` (registry moved), `both` (diverged), `unknown` (pre-lock install) — in human
output and `--json`; and no-arg `diff` iterates the lock, so blocks/motion/lib items are
finally covered (previously only the ui dir was scanned). Lock-less projects behave
exactly as before. Key insight: no registry checksum needed for attribution — three-way
content-hash comparison (local / current registry / locked) is per-file precise.
Changeset minor → **0.6.0**; `--version` bumped.

**Verified:** typecheck ✓ · CLI tests 55/55 (+8 lock: merge semantics, deterministic
round-trip, all 4 causes) ✓ · e2e against a mutable local registry copy (static server
over `public/r`): `init` → lock has utils; `add button card` → lock has 3 items, no-arg
diff up-to-date incl. lib; local edit → `cause: local`; mutate served card.json →
`cause: upstream`; both → `diverged` label in human mode; deleted lock entry →
`unknown`; `add card --overwrite` heals to up-to-date; `apply` (plan with a motion item)
→ lock written, diff clean, consumer strict `tsc` PASS; `--version` 0.6.0.

**Follow-ups:** www CLI docs + llms CLI_MD don't mention lorre.lock/diff causes yet
(ride the next www branch); owner must merge the next Version Packages PR to publish
0.6.0. Plan-file gotcha for e2e: the items key is `add`, not `items`.

**Next:** remaining Phase 5 items — CI registry validation on PRs / render tests /
dependency audit; immutable caching for registry JSON. Or Phase 4.3 MCP server.

---

## 2026-07-12 — Phase 3.3: landing polish (theme carousel + motion dogfood)

**PR #11 owner-merged 16:54Z; batch 7 confirmed live in production** (manifest 55, motion
docs pages + `/r/<motion>.json` + md twins all 200).

**Shipped (branch `feat/landing-polish` → PR):** the Radix-style landing section locked in
Phase 3. New shared `apps/www/lib/theme.ts` (applyTheme + `lorre-theme-change` window event;
theme-controls refactored onto it) so the new **ThemeCarousel** — pills above the live
showcase — and the header picker stay in sync in both directions. The carousel auto-cycles
basic → dreamy → utilitarian every 4s for fresh visitors only (stored non-basic theme or
prefers-reduced-motion disables it; hover pauses; any manual pick stops it for good) with an
`aria-live` blurb describing each theme. The landing now **dogfoods batch 7**: a Marquee
strip of all non-lib registry item names (edge-masked), a CountUp stats band (55 / 3 / 1 —
derived from the registry import, so counts never go stale), FadeIn-staggered feature cards.
Hero badge now reads components · blocks · motion · themes.

**Verified:** www build ✓ (60 pages) · Playwright vs `next start`: fresh visitor auto-cycles
to dreamy at ~4.5s (override style + `--primary` violet asserted, header label follows);
manual pick stops the cycle (still utilitarian 4.5s later); header picker → carousel pill
syncs back; marquee animates with real item names; stats land on exactly 55/3/1; all 4
fade-ins visible; returning visitor with stored dreamy gets no auto-cycle; reduced-motion
context: no auto-cycle after 4.5s and marquee `animation-name: none`; dark mode screenshot
reviewed — zero console/page errors.

**Next:** PR → owner merge. Then Phase 5 (lorre.lock, CI hardening) or more motion items;
Phase 4.3 MCP server remains the stretch goal.

---

## 2026-07-11 (6) — Batch 7: first motion items (marquee, count-up, fade-in) — registry 55

**Shipped (registry 52 → 55): the first `registry:motion` items**, all `source: "lorre"`,
under `packages/registry/src/motion/`: **marquee** (infinite logo/ticker strip — pure CSS,
content rendered twice + `-50%` loop via a new `--animate-marquee` token emitted by
`build-css.ts`; `pauseOnHover`/`reverse` props; no `"use client"` needed), **count-up**
(IntersectionObserver + rAF ease-out counter; fixed `en-US` Intl formatting and a single
text child to avoid RSC hydration mismatches; jumps straight to the value under
prefers-reduced-motion), **fade-in** (reveal-on-scroll wrapper whose duration rides
`--motion-duration-slow`, so utilitarian reveals faster than dreamy; `delay` staggers
siblings; `motion-reduce` disables the transition). CLI needed **zero changes** —
`targetDirForType` has routed `registry:motion` → `components/motion/` since Phase 0, so
no changeset/release this batch. Registry package gained a `./motion/*` export.

**www (branch `feat/batch7-motion` → PR):** new `/docs/motion/[name]` pages (full-column
preview like blocks), Motion group in sidebar + ⌘K search, 3 demos, llms motion twins +
Motion section. Also cleared the Phase 4.2 follow-up: `/docs/cli` page and the llms
CLI_MD now document `plan check` / `apply`.

**Verified:** registry build ✓ (55, deterministic) · typecheck ✓ · tests 67/67 ✓ · www
build ✓ (60 pages) · Playwright vs `next start`: 3 pages × 3 themes × light/dark (18
combos, real theme-switcher driven, `--primary` + `.dark` asserted) — marquee transform
advances and pauses on hover, count-up lands on exactly "52 / 99.9% / +1,284", fade-in
staggers 0/150/300ms; a `reducedMotion: "reduce"` context shows count-up instantly,
marquee `animation-name: none`, fade-in `transition: none`; sidebar/⌘K/Code-tab checks
pass — zero console/page errors. CLI e2e in a fresh consumer against the local registry:
`init` + `add marquee count-up fade-in` → `components/motion/`, strict `tsc --noEmit`
PASS, re-add without `--yes` correctly skips (note: `--yes` implies overwrite).
Repo now has `.claude/skills/verify/SKILL.md` capturing this recipe.

**Next:** PR → owner merge (deploys registry 55 + motion docs). Then Phase 3.3 (landing
polish, last www phase) or more motion items (typewriter, shimmer, animated-gradient).

---

## 2026-07-11 (5) — Batch 6: marketing block set complete (features, testimonials, stats, navbar) — registry 52

**PR #8 owner-merged 10:11Z, batch 5 confirmed live in production** (manifest 48, block
pages + md twins 200, llms.txt Blocks section; published CLI 0.4.0 `search --category
block` returns all 5). Gotcha: Vercel's edge cache in `sin1` served the *old* deploy for
several minutes after "Deployment has completed" — verify production with a cache-busting
query param before concluding a deploy failed.

**Shipped (registry 48 → 52), same conventions as batch 5:** **features** (2-4 col grid,
optional `icon` ReactNode), **testimonials** (quote cards with avatar/initials fallback,
composes card + avatar), **stats** (big-number band, free-form value strings, grid adapts
3 vs 4 cols by item count), **navbar** (brand + links + actions + sticky blur; **first
client-interactive block** — mobile hamburger via `useState`, so `"use client"`). The
marketing-page set is now complete: navbar + hero + features + stats + testimonials +
pricing + faq + cta + footer composes a full landing page — Phase 4.2's `plan` will have
a real palette to work with.

**www (branch `feat/batch6-blocks` → PR):** only 4 demos + map entries — the blocks docs
route, sidebar, ⌘K search, and llms twins all derive from the registry, so batch 5's
infrastructure picked the new items up with zero code changes.

**Verified:** registry build ✓ (52) · typecheck ✓ · tests 56/56 ✓ · www build ✓ (57
pages) · Playwright vs `next start`: 4 pages × 3 themes × light/dark (24 combos, theme
override + `.dark` asserted), navbar hamburger opened/closed at 390px with all 6
links/actions present — zero console/page errors · CLI e2e against local registry: `add
features testimonials stats navbar` resolved 8 (avatar pulled fresh; utils/card/button
correctly skipped as already installed), consumer `tsc --noEmit` strict PASS.

**Same session, after PR #9 owner-merged (batch 6 verified live: manifest 52, all
endpoints 200):** Phase 4.2 **design locked** → `docs/phase-4.2-design.md`. Key decision:
the CLI stays deterministic — the *agent* reads the PRD and writes `plan.json`; the CLI
gets `plan check` (validate + resolve, read-only) and `apply` (init+add in one run,
records `lorre.plan.json`). v1 fences: `pages` is metadata only, `tokenOverrides` =
semantic remaps only, gaps never block. Ships as CLI 0.5.0.

**Same session — Phase 4.2 implemented (`plan check` + `apply`), queued as CLI 0.5.0.**
New `src/utils/plan.ts` (hand-rolled validation — flat problems list an agent can iterate
on; overrides emitter re-declares every override under `.dark` per the Phase 1 rule) +
`commands/plan.ts` / `commands/apply.ts`, wired as `plan check <file>` and
`apply <file>`. Apply = init+add in one run: components.json (existing aliases/registry
preserved), theme block + `/* lorre-blocks overrides start|end */` block (stripped when a
re-applied plan has none), one package-manager pass (base + item deps), records
`lorre.plan.json`. Changeset added (minor → 0.5.0); `--version` string bumped.

**Verified:** typecheck ✓ · CLI tests 47/47 (was 36; +11 for plan validation/overrides
CSS/injection) ✓ · e2e in a fresh consumer against a local registry: bad plan → `{ok:
false, problems:[4]}` exit 1 (all problems in one pass); the acme-landing plan (9 blocks,
dreamy, `primary: accent-10` override, 1 gap) → one `apply` = 16 items resolved, 16 files
written, theme+overrides blocks correctly ordered in globals.css with `.dark` re-declare,
`lorre.plan.json` recorded, re-run idempotent (0 written / 16 skipped), consumer strict
`tsc --noEmit` PASS on TS 6.

**Follow-ups:** www docs CLI page + build-llms CLI_MD don't mention plan/apply yet (ride
the next www branch); `plan.schema.json` not published at lorre-blocks.dev; owner must
merge the next Version Packages PR to publish 0.5.0.

**Next:** merge Version Packages (0.5.0), update www CLI docs, then motion items
(batch 7) or Phase 3.3 (landing polish).

---

## 2026-07-11 (4) — Batch 5: first blocks (hero, pricing, faq, cta, footer) — registry 48

**PR #6 (Version Packages) + PR #7 (Phase 3.2 + Next 16) owner-merged.** Verified: CLI
**0.4.0 live on npm** (`latest`), production serves `llms.txt` + md twins (200), manifest
still 43 items pre-batch — Next 16 built clean on Vercel.

**Shipped (registry 43 → 48): the first `registry:block` items**, all `source: "lorre"`
(written from scratch), under `packages/registry/src/blocks/`: **hero** (eyebrow badge +
headline + actions), **pricing** (tier cards, free-form price strings, `highlighted`),
**faq** (accordion of Q/A pairs), **cta** (accent- or outline-variant banner), **footer**
(brand + link groups + legal line). Design decisions: content is **serializable props**
(RSC-safe, agent-configurable — no JSX children required), links render as plain `<a>` via
`buttonVariants` so blocks work in any React app (not just Next), semantic tokens only,
plain functions + `data-slot`, theme-agnostic. CLI needed **zero changes** —
`targetDirForType` has routed `registry:block` → `components/blocks/` since Phase 0.
Registry package gained a `./blocks/*` export for www imports.

**www (branch `feat/batch5-blocks` → PR):** new `/docs/blocks/[name]` pages with
**full-width preview** (blocks are page sections — the centered component preview box
doesn't fit), Blocks group in the sidebar and ⌘K search, 5 hand-written demos;
`build-llms.ts` now emits `/docs/blocks/<name>.md` twins plus a Blocks section in
`llms.txt`/`llms-full.txt`.

**Verified:** registry build ✓ (48 items, validation + deterministic) · typecheck ✓ ·
tests 56/56 ✓ · www build ✓ (53 static pages) · Playwright vs `next start`: all 5 block
pages under basic/dreamy/utilitarian × light/dark (30 combos) with theme-override and
`.dark` asserted per page, FAQ accordion opens, Code/Preview tabs switch, ⌘K "pricing"
lands on `/docs/blocks/pricing` — zero console/page errors. Screenshots reviewed: dreamy
dark pricing shows violet accent + highlighted tier; utilitarian cta panel goes monochrome.
**CLI e2e (first block install ever):** built CLI against a locally served registry in a
fresh consumer — `init --theme basic` then `add hero pricing faq cta footer` resolved 11
items (button/badge/card/accordion/separator pulled automatically), wrote blocks to
`src/components/blocks/`, one npm pass with versioned ranges; consumer then passes
`tsc --noEmit` strict on TypeScript 6.

**Next:** Phase 4.2 (`lorre plan`/`apply`), Phase 3.3 (landing polish), or batch 6
(motion items / more blocks: features, testimonials, stats, header-nav).

---

## 2026-07-11 (3) — Phase 3.2: llms.txt + markdown twins; Next 16 (backlog 4)

**PR #5 merged by owner 09:31Z** (backlog 1–3 + engines). Changesets opened **PR #6
"Version Packages"** — owner must merge it to publish CLI 0.4.0 to npm.

**Phase 3.2 shipped (branch `feat/llms-txt`):** new `apps/www/scripts/build-llms.ts` runs
in www's prebuild (after registry build) and generates into `public/` (gitignored,
deterministic — no timestamps, sorted order):
- `/llms.txt` — llmstxt.org index: project summary + links to every markdown twin
- `/llms-full.txt` — everything inlined (~124 KB): guides + all 42 component docs with source
- `/docs/components/<name>.md` — twin per component (description, install, deps, tags, full source)
- `/docs/{index,theming,cli}.md` — twins of the static docs pages (content maintained in the script)

**Backlog item 4 (same branch):** `next` ^15.1 → **^16.2.10**. Zero code changes — async
params were already in use; Turbopack is now the default bundler (build output says so).

**Verified:** `next build` clean on 16.2.10 (48 static pages) · `next start` serves
llms.txt / llms-full.txt / button.md / calendar page all 200 with expected content ·
Playwright on landing + date-picker popover: renders fine, zero console/page errors.

**Next:** batch 5 (blocks: hero, pricing, FAQ, CTA, footer) or Phase 3.3 (landing polish)
or Phase 4.2 (`lorre plan`/`apply`). Upgrade backlog is fully cleared.

---

## 2026-07-11 (2) — Upgrade backlog items 1+2: dep majors + React 19 sweep

**Backlog item 1 — dependency drift (high):** workspace now tests what consumers install:
tailwind-merge ^3.6.0, sonner ^2.0.7, lucide-react ^1.24.0, react-day-picker ^10.0.1 (www
package.json bumped to match). calendar.tsx survived rdp v10 untouched — v10 only removed
v8-era classNames aliases (`nav_button`, `day_selected`…); we already use the v9 names. No
code changes needed anywhere for the four majors; typecheck/tests caught nothing.

**Decision — versioned registry deps:** `registry.ts` keeps *bare* npm dep names;
`build-registry.ts` resolves each against `packages/registry/package.json` dependencies at
build time and emits `name@range` (e.g. `tailwind-merge@^3.6.0`) into `/r/<name>.json` +
index. Build fails if an item's dep isn't declared in package.json — the drift class of bug
is now structurally impossible. CLI (queued as **0.4.0** via changeset): `init`
BASE_DEPENDENCIES pinned to the same ranges, and install args are quoted on Windows because
`spawn(..., { shell: true })` routes through cmd.exe, whose escape char is `^` — unquoted
`pkg@^3.6.0` would silently degrade to `pkg@3.6.0`.

**Backlog item 2 — React 19 sweep:** all 31 pre-batch-4 components rewritten as plain
functions + `data-slot` (matching batch 4); `forwardRef`/`ElementRef`/`displayName` fully
gone from `src/ui/`; `"use client"` added to Radix-based files. Breaking for consumers who
re-add: `ButtonProps` no longer exported (pagination now uses
`Pick<React.ComponentProps<typeof Button>, "size">`); combobox/date-picker accept `ref` as a
plain prop (React 19). Pure re-export aliases (Tooltip, Dialog, Select roots…) became
wrapper functions so every slot carries `data-slot`.

**Verified:** typecheck ✓ · tests 56/56 ✓ · www production build ✓ (49 pages) · Playwright
against `next start`: calendar + date-picker open/select (rdp 10), sonner toast fires (v2),
dropdown + dialog open, landing re-themes live to dreamy and utilitarian incl. dark mode,
`data-slot` attributes confirmed in DOM — zero console/page errors across all pages driven.

**Backlog item 3 (same session, pushed to the same PR):** commander ^15, @clack/prompts
^1.7, zod ^4 (registry build script only user of zod). Zero code changes — typecheck, 56/56
tests, registry build, and a built-CLI smoke test (`--version`, `search button --json`
against the production registry) all pass. Patch changeset added; rides the 0.4.0 release.
Follow-up: CLI now declares `engines.node >=22.12.0` (commander 15's floor — install-time
warning instead of runtime crash on old Node); workspace root bumped `>=18` → `>=22.13`
(pnpm 11 floor). CI already on Node 22.

**Next:** batch 5 (blocks) or Phase 3.2 (llms.txt); backlog 4 (next 16) waits for a www
branch.

---

## 2026-07-11 — Batch 4: 6 items (registry 43) + upgrade audit → PLAN backlog

**Shipped (registry 37 → 43):** textarea, input-otp (new `input-otp` dep; fake caret uses a
new `--animate-caret-blink` token — fixed 1.25s cadence on purpose, a caret shouldn't speed
up with a theme's motion), toggle-group (composes `toggleVariants` via a `toggle`
registryDependency), scroll-area, drawer (vaul; direction-aware via
`data-[vaul-drawer-direction=*]` selectors, bottom drawers get a drag handle), menubar
(mirrors dropdown-menu's styling vocabulary).

**First React-19-style items:** written as plain function components with `data-slot`
attributes — no `forwardRef`/`ElementRef` (deprecated in React 19). Per the upgrade backlog
in PLAN.md, the existing 31 components get back-migrated in one sweep later; new items use
the new style from the start.

**Upgrade audit (also 2026-07-11, see PLAN.md "Upgrade backlog"):** the key finding is that
registry npm deps are unversioned, so consumers install *latest* (tailwind-merge 3, sonner 2,
lucide 1) while the workspace tests against old majors — confirmed live during acceptance
(`init` installed tailwind-merge ^3.6.0). tailwind-merge v3 is the Tailwind-v4-aware release;
workspace should catch up.

**Verified:** typecheck ✓ (all packages) · tests 56/56 ✓ · deterministic rebuild ✓ (+5
intended caret-blink lines in generated theme.css) · www production build ✓ (42 component
pages incl. the 6 new) · CLI end-to-end in a fresh Vite + Tailwind v4 app against a locally
served registry: `init --theme basic` + `add` (6 requested → 7 written, toggle pulled
automatically, one npm pass), then visual acceptance under basic/dreamy/utilitarian ×
light/dark — OTP typed with caret visible, menubar File menu + Share submenu opened, drawer
opened with drag handle; zero console errors in all 6 runs.

**www demos: PR #4 (`feat/batch4-demos`) owner-merged same day (03:29Z).** Production
confirmed: `/r/manifest.json` → 43 items, `/r/drawer.json` → 200, docs pages live with
Previews. Batch 4 is installable by real users.

**Next:** Phase 3.2 (llms.txt) or batch 5 (blocks: hero, pricing, FAQ, CTA, footer) or the
PLAN upgrade backlog item 1 (dependency alignment).

---

## 2026-07-10 — Phase 3.1: docs app + landing page (PR #3 merged)

Owner enabled "Allow GitHub Actions to create and approve pull requests" — the Release
workflow can now open Version Packages PRs itself.

**PR #3 merged 2026-07-10T08:04:18Z** (merge commit `9089db6`). CI build passed; the
"Vercel" status check showed FAILURE but that's the known Hobby-plan collaborator-invite
link artifact, not a real deploy failure. Confirmed live: `https://lorre-blocks.vercel.app/r/manifest.json`
reports `itemCount: 37`, both sources (`shadcn`, `lorre`), all 3 themes — batch 1–3 registry
JSON and the docs app are both in production.

**Shipped (all `apps/www`, fully static — 43 pages):**
- **Landing:** hero + quickstart snippet + live component sampler + feature grid. The header
  has a **runtime theme switcher** that applies a theme exactly like the CLI does — fetches
  `/r/themes/<name>.json` and swaps the token block via an injected `<style>`; persisted in
  localStorage (CSS cached to avoid FOUC) — plus a dark-mode toggle.
- **Docs:** sidebar generated from registry metadata (`source: "lorre"` items get a badge),
  guide pages (`/docs`, `/docs/theming`, `/docs/cli`), and `/docs/components/[name]` for all
  36 UI items: description + source/license badges, `add` snippet with copy button,
  **Preview/Code tabs** (hand-written live demo per component; shiki-highlighted source read
  from the workspace at build time), dependency links, tags. **⌘K search** over guides +
  components using the registry command component.
- Registry package gained `./registry` + `./schema` exports so www imports metadata directly;
  www tsconfig maps `@/components/ui/*` like the registry's own tsconfig (cross-component
  imports compile via transpilePackages).

**Verified:** `next build` clean (43 static pages, no SSR — safe for the fs-read of component
source, it only happens at build). Playwright pass against `next start`: landing light/dark,
dreamy applied via header picker **and persisting across reload**, docs intro, date-picker
page preview + code tabs, ⌘K search typed "combo" → lands on `/docs/components/combobox`;
zero console errors.

**Next:** Phase 3.2 (`llms.txt` + raw-markdown twins) or Phase 2 batch 4.

---

## 2026-07-10 — Batch 3 ships: forms, dates, command palette. Phase 2 core set complete (37 items)

PRs #1 (CLI 4.1) and #2 (Version Packages) were owner-merged this morning — **CLI 0.3.0 is
live on npm** and the www deploy landed (`/r/themes/index.json` → 200 in production).
Batch 3 went straight to master.

**Shipped (11 items, registry 26 → 37):**
- **Simple primitives:** toggle, collapsible, progress, slider, breadcrumb, pagination
  (composes `buttonVariants` via a `button` registryDependency, like alert-dialog).
- **command** (cmdk; `CommandDialog` composes dialog — adds an sr-only `DialogTitle` for a11y).
- **form** (react-hook-form v7: FormField/Item/Label/Control/Description/Message with wired
  aria + error states; resolver left to the consumer).
- **calendar** (react-day-picker **v9** classNames API — not the v8 shadcn classic; root gets
  `w-fit` so standalone calendars don't stretch, found by visual acceptance).
- **First two `source: "lorre"` items:** **combobox** (popover + command + button, options as
  `{value,label}[]`, controlled or uncontrolled) and **date-picker** (popover + calendar +
  button, locale-formatted trigger, `calendarProps` passthrough). Original APIs → lorre source,
  per the Phase 0 rules.

**Verified:** typecheck ✓ · tests 56/56 ✓ · deterministic rebuild ✓ · visual acceptance in a
fresh Vite + Tailwind v4 app via CLI `init` + `add` (12 requested → 17 resolved in one npm
pass; cross-component deps pulled button/dialog/popover/label automatically) under
basic/dreamy/utilitarian, light + dark; interactions exercised per theme: combobox filters
and selects, date-picker picks a date into the trigger, form shows the validation error,
screenshots fail the run on any console error.

**Gotcha (Windows):** the CLI's npm-install step hangs when the CLI itself runs as a nested
background process (npm sat at 0.15s CPU for 12 min); foreground runs are fine. Worth an
eye if `add`/`init` are ever driven from another tool on Windows.

**Next:** Phase 3.1 docs app (feature branch → PR), or continue batch 4 (input-otp, textarea,
toggle-group, scroll-area, drawer, menubar).

---

## 2026-07-10 — Phase 2 batch 2: 11 more items (surfaces, data, overlays, toast)

Straight to master. Registry now **26 items**.

**Shipped:**
- **Surfaces & status:** card, badge (default/secondary/destructive/success/warning/outline),
  avatar, alert (tinted `danger-2/6/11`-style scale steps per variant), skeleton, table.
- **Overlays:** alert-dialog (composes `buttonVariants` via a `button` registryDependency —
  first cross-component dep; CLI's `rewriteImports` already handled `@/components/ui/*`,
  registry tsconfig got a `@/components/ui/* → src/ui/*` path mapping so in-repo typecheck
  resolves it), sheet (4 sides), hover-card, context-menu.
- **sonner** toast host styled via CSS vars (`--normal-bg: var(--popover)` etc.) — no
  next-themes dependency; `theme` prop left to the consumer.
- **Slide animation tokens:** `--animate-slide-in-top/bottom/left/right` + `lorre-slide-in-*`
  keyframes on `--motion-duration-slow`, so sheets animate per theme.

**Verified:** typecheck ✓ · tests 41/41 ✓ · deterministic rebuild ✓ · visual acceptance in
the same Vite + Tailwind v4 app via CLI `add` (11 components, one npm pass) + `theme apply`:
batch 2 renders under basic/dreamy/utilitarian, light + dark; alert-dialog/sheet/hover-card/
context-menu/toast all open and are token-correct (screenshots per theme).

**Next:** Phase 3.1 docs app (feature branch → PR), or Phase 2 batch 3 (combobox, command,
form, date picker — heavier deps).

---

## 2026-07-10 — Phase 2 batch 1: 12 primitives ported + dark-mode token bug fixed

Committed straight to master (packages/* workflow). PR #1 (Phase 4.1 agent-readable CLI,
branch `feat/cli-agent-baseline`) opened today and still waiting on the owner to merge —
that merge also triggers the overdue www deploy.

**Shipped:**
- **12 new components** (all `source: "shadcn"`, MIT, rewired onto Lorre semantic tokens):
  label, separator, checkbox, switch, radio-group, tabs, tooltip, accordion, dialog,
  popover, dropdown-menu, select. Registry now has 15 items.
- **Animation tokens** in `themeToCss`: `--animate-fade-in/panel-in/accordion-down/up` +
  `lorre-*` keyframes, durations wired to `--motion-duration-*` so `utilitarian` animates
  faster with zero component changes. Overlay components use them.
- `packages/registry` exports collapsed to `./ui/*`; Radix + lucide-react deps added.

**Bug found by visual acceptance (real, shipped in Phase 1): dark mode never applied.**
A custom property resolves its `var()` refs on the element that *declares* it, so
`--background: var(--neutral-1)` computed on `:root` inherited the light value into `.dark`
subtrees — re-declaring only the scales in `.dark` did nothing. Fix: `.dark` now re-declares
**every** semantic. Regression test added (`re-declares every semantic in .dark`).

**Verified:** typecheck ✓ · tests 41/41 ✓ · registry build deterministic ✓ · **visual
acceptance in a real Vite + Tailwind v4 app** (CLI `theme apply` + `add` end-to-end against
a locally served registry): all 14 components render under basic/dreamy/utilitarian in
light **and** dark (6 screenshot matrices), overlays (dialog/popover/dropdown/select/tooltip)
open correctly, and theme swaps touch zero component files. `add` with 14 components
installs deps in a single npm pass.

**Release pipeline note:** the Release workflow fails on master pushes with a queued
changeset because the repo blocks Actions from creating PRs. Worked around by manually
creating the Version Packages PR (#2) from the action-maintained `changeset-release/master`
branch — the action *updates* an existing PR fine, so subsequent runs pass. Permanent fix
(owner): Settings → Actions → General → enable "Allow GitHub Actions to create and approve
pull requests". **Merge order: #1 (www deploy) before #2 (publishes CLI 0.3.0).**

**Next:** Phase 2 batch 2 (card, badge, avatar, table, form-adjacent primitives), then
docs app (Phase 3.1).

---

## 2026-07-09 — Phase 4.1 shipped: agent-readable CLI (`--json`, `search`, `info`)

Branch `feat/cli-agent-baseline` → PR (this also gives the owner a merge to trigger the
overdue www deploy).

**Shipped:**
- `src/utils/output.ts` — the whole CLI now writes through one output layer. In JSON mode
  every human message is suppressed, warnings are collected into the payload, spinners become
  no-ops, and the command emits exactly one document: `{ok:true,...}` or `{ok:false,error}`
  with exit 1.
- `--json` on **every** command, and it implies non-interactive: `init` takes defaults instead
  of prompting; `add` skips existing files instead of asking (`--overwrite` to replace).
- `search [query...]` — ranked over name/tags/category/description (name hits outrank tag hits
  outrank description hits), with `--category --source --theme --type --limit` facets. An empty
  query + filters is a faceted listing. Items without `themes` are treated as theme-agnostic.
- `info <name>` — metadata, transitive `installOrder`, unioned `npmDependencies`, and the
  **resolved target path** each file would be written to in the consumer project (`--files`
  adds contents). This is what lets an agent predict a write before doing it.
- `fetchIndex` now returns full v2 metadata; added `fetchManifest`.

**Bug found and fixed by the work:** `installDependencies` used `stdio: "inherit"`, so npm's
"up to date, audited 52 packages" leaked onto stdout and corrupted the JSON document. It now
captures output when silent, and surfaces the last 5 lines only if the install *fails*.
Regression-covered in `output.test.ts` + `package-manager` silent path.

**Verified:** typecheck ✓ · cli tests 36/36 (was 21) ✓ · against a live registry: `list`,
`search`, `info`, `theme list`, `init`, `add`, `diff`, `theme apply` all emit parseable JSON
with zero ANSI leakage; error paths emit `{ok:false}` + exit 1; human mode unchanged.
Agent chain `search "text field" → info input → add` works end to end.

**Next:** Phase 2 — component porting, now agent-assistable via `search`/`info`.

---

## 2026-07-09 — Phase 1 shipped: token architecture, 3 themes, theme CLI

**Shipped:**
- **Token source of truth** (`packages/registry/src/tokens/`): a theme is data — five color
  seeds (`neutral`, `accent`, `danger`, `success`, `warning`) plus radius/shadow/motion/
  typography values. `scale.ts` generates Radix-style **12-step OKLCH scales** (light + dark)
  from each seed; `DEFAULT_SEMANTICS` maps `primary → accent-9`, `muted-foreground →
  neutral-11`, `primary-foreground → on-accent` (contrast computed), etc.
- **Two emitters, one source:** `themeToCss` (Tailwind v4 `:root`/`.dark` + `@theme inline`)
  and `themeToDtcg` (W3C DTCG, sRGB hex `$value` with exact OKLCH in `$extensions`).
- **Themes with `extends`:** `basic` (root) · `dreamy` (violet accent, large radii, plush
  shadows) · `utilitarian` (monochrome accent, sharp radii, fast motion). Emitted to
  `/r/themes/<name>.json` (CSS), `/r/tokens/<name>.json` (DTCG), `/r/themes/index.json`.
  `/r/theme.json` kept as a legacy alias for `basic` → **published CLI 0.2.0 keeps working**.
- `src/styles/theme.css` is now **generated** from the basic theme (header marks it so).
- **CLI (→ 0.3.0, changeset queued):** `init --theme <name>` with an interactive picker,
  `theme list` (marks the active theme + `extends`), `theme apply <name>`; active theme is
  recorded in `components.json`. `fetchThemeCss` falls back to `/r/theme.json` for old registries.

**Verified:** `pnpm build:registry` ✓ (output deterministic across two runs) · `pnpm typecheck` ✓ ·
tests 40/40 (cli 21, registry 19) ✓ · **acceptance:** in a real Tailwind v4 Next.js app,
`theme apply dreamy` swapped the theme block, `next build` compiled the dreamy accent
(`oklch(0.62 0.2 292)`) into the CSS, and `button.tsx` + `utils.ts` stayed byte-identical.
Round-tripped basic → dreamy → utilitarian → basic; the theme block never duplicates.

**Not done yet:** spacing/breakpoint/line-height are emitted as shared DTCG layout tokens but
aren't theme-overridable. Registry is stale on Vercel (`/r/theme.json` 404 there) until the
next owner-merged www deploy — CLI 0.3.0 should not be published before that deploy lands,
or `init` will 404 on themes for real users.

**Next:** Phase 4.1 — CLI `--json` on all commands, `search`, `info` (agent-readable baseline),
before mass component porting.

---

## 2026-07-09 — Phase 0 shipped: classification schema, validation, docs

**Decisions locked (with Dimas):**
- Align UI: license unclear → **rewrite from scratch**, never copy; rewrites are `source: "lorre"`.
- Ship **3 themes** from the start: `basic`, `dreamy`, `utilitarian`.
- Token JSON format: **W3C DTCG standard**.
- Workflow reconfirmed: `apps/www` changes go on a feature branch → Dimas PRs → owner
  merges (Vercel Hobby deploy constraint). `packages/*` changes push straight to master.
  Note: `apps/www/public/r/` is gitignored and rebuilt by `prebuild` on deploy, so Phase 0
  needed no www branch — the live registry picks up schema v2 on the next www deploy.

**Shipped:**
- Registry **schema v2** (`packages/registry/src/schema.ts`): classification axes
  (`source`, `category`, `themes`, `tokenType`, `tags`, `license`), new item types
  (`registry:token|theme|block|motion|icon|asset`), `REGISTRY_SCHEMA_VERSION = 2`.
- `build-registry.ts`: zod validation (fails build on bad metadata), per-item sha256
  `checksum`, faceted `index.json` (still a flat array — back-compat with published CLI 0.2.0),
  new `manifest.json` (schemaVersion, facet summaries). Build output is deterministic.
- Backfilled `button`, `input`, `utils` with full metadata (all `source: "shadcn"`, MIT).
- CLI: types extended with optional v2 fields; `targetDirForType` maps `registry:block` →
  `components/blocks`, `registry:motion` → `components/motion`, unknown → lib.
  No behavior change for existing commands → **no npm publish needed**.
- Docs: `lorre.md` (design system / Lorre Skill), `docs/PLAN.md` (roadmap), this log.

**Verified:** `pnpm build:registry` ✓ · `pnpm typecheck` ✓ · `pnpm test` 21/21 ✓

**Next:** Phase 1 — token architecture (`src/tokens/`), DTCG JSON emit, 3 themes,
then CLI `--json`/`search`/`info` (Phase 4.1) before mass porting.
