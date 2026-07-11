# Lorre Blocks — Progress Log

Running log, newest entry first. One entry per working session; record decisions, what
shipped, and what's next so any human or agent can pick up from here.

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
