# Lorre Blocks — Roadmap

> Companion docs: [`lorre.md`](../lorre.md) (design system rules) ·
> [`PROGRESS.md`](./PROGRESS.md) (running log).
> Decisions locked 2026-07-09: Align UI code is **rewritten from scratch** (never copied);
> we ship **3 themes** from the start (`basic`, `dreamy`, `utilitarian`); token JSON follows
> the **W3C DTCG** standard format.

## Vision

A design token + component registry for internal Lorre projects: Radix-style token/theme
architecture, shadcn-style CLI distribution, classified along 4 axes
(source / theme / category / token-type), and agent-first — an agent should be able to go
from PRD + IA + design direction to a fully token-configured project via the CLI, and extend
the registry itself when a genuine gap exists.

## Phase 0 — Foundation: schema & classification ✅ (2026-07-09)

- [x] Registry schema v2: `source`, `category`, `themes`, `tokenType`, `tags`, `license`; new item types (`registry:token|theme|block|motion|icon|asset`)
- [x] Build-time zod validation (kebab-case names, required descriptions, license on ported items, resolvable registry deps)
- [x] Per-item sha256 `checksum`; faceted `/r/index.json` (kept as array for CLI back-compat); new `/r/manifest.json` with `schemaVersion`
- [x] Deterministic build output (rebuild with no changes → no diff)
- [x] Backfill button/input/utils metadata; CLI types updated (no publish needed)
- [x] `lorre.md`, `docs/PLAN.md`, `docs/PROGRESS.md`

## Phase 1 — Design tokens layer + theme system ✅ (2026-07-09)

- [x] Token architecture in `packages/registry/src/tokens/`: seeds → generated 12-step OKLCH
      scales for `neutral`, `accent`, `danger`, `success`, `warning`; semantic aliases;
      typography, radius, shadow, motion token groups
- [x] One source, two outputs: Tailwind v4 `@theme` CSS (`themeToCss`) **and** W3C DTCG JSON
      (`themeToDtcg`) → `/r/themes/<name>.json` + `/r/tokens/<name>.json`
- [x] Theme system with `extends`: `basic` (root), `dreamy`, `utilitarian`;
      `/r/themes/index.json`; `/r/theme.json` kept as a legacy alias for `basic`
- [x] `src/styles/theme.css` is now generated (basic theme); build output stays deterministic
- [x] CLI `init --theme <name>` (+ interactive picker), `theme list`, `theme apply <name>`;
      active theme recorded in `components.json`. Changeset queued → CLI 0.3.0
- [x] **Acceptance verified:** `theme apply dreamy` in a Tailwind v4 app swaps the theme block
      in `globals.css`, rebuilds to the dreamy accent, and leaves `button.tsx`/`utils.ts`
      byte-identical — one command, zero component edits.

Deferred to a later pass: spacing/container/breakpoint and letter-spacing/line-height are
emitted as shared DTCG layout tokens but are not yet theme-overridable.

## Phase 2 — Component porting (continuous)

Order: (1) core primitives ~20 (accordion, dialog, dropdown, popover, tooltip, select,
checkbox, radio, switch, tabs, toast…), (2) form & data (table, form, combobox, date picker,
badge, avatar, card), (3) blocks (hero, pricing, FAQ, CTA, footer), (4) motion/interaction
(Magic UI / React Bits style).

Rules: shadcn/Radix/Magic UI are MIT → port with `license: "MIT"` + correct `source`.
**Align UI → rewrite from scratch**, `source: "lorre"`. Every port is rewired onto Lorre
semantic tokens and must render correctly under all 3 themes before it merges.

Progress: **batch 1 done 2026-07-10** — label, separator, checkbox, switch, radio-group,
tabs, tooltip, accordion, dialog, popover, dropdown-menu, select (12 items).
**Batch 2 done 2026-07-10** — card, badge, avatar, alert, skeleton, table, alert-dialog,
sheet, hover-card, context-menu, sonner (registry total 26).
**Batch 3 done 2026-07-10** — toggle, collapsible, progress, slider, breadcrumb, pagination,
command, form, calendar, plus the first two `source: "lorre"` compositions: combobox and
date-picker (registry total **37**). Core primitive set is complete; batch 4 candidates:
input-otp, textarea, toggle-group, scroll-area, drawer, menubar, then blocks (hero, pricing,
FAQ, CTA, footer) and motion.

## Phase 3 — Docs app (`apps/www`)

- 3.1 ✅ (2026-07-10, PR #3 merged) Docs layout: sidebar generated from registry metadata,
  landing page with runtime theme switcher, component pages with Preview/Code tabs + `lorre add`
  snippet, ⌘K search. Live in production — `/r/manifest.json` confirms 37 items, all 3 themes.
- 3.2 Agent readability: `llms.txt` + `llms-full.txt`, raw-markdown twin per docs page
- 3.3 Landing page polish (last): Radix-style single-section with theme-switching carousel
- Workflow: every www change ships via feature branch → PR → owner merge (Vercel Hobby constraint)

## Phase 4 — Agent-friendly CLI

- 4.1 ✅ (2026-07-09) Machine-readable baseline: `--json` on every command (one JSON doc on
  stdout; `{ok:false,error}` + exit 1 on failure; package-manager output captured so stdout
  stays parseable), `--json` implies non-interactive, `search <query>` with category/source/
  theme/type/limit facets, `info <name>` with install order + resolved target paths
- 4.2 Build-from-spec: `lorre plan --spec prd.md --json` (theme choice + add-list + token
  overrides + gap list) and `lorre apply plan.json`. Gap handling follows the sculpt-vs-create
  decision tree in `lorre.md`; new items ship as patch releases via existing CI.
- 4.3 (Stretch) `@lorre-blocks/mcp` MCP server: `search_registry`, `get_component`, `apply_theme`

## Phase 5 — Security, performance, automation hardening

- `lorre.lock` in consumer projects (version + checksum per installed item) → accurate `diff`
- CI: registry validation on every PR, render-test per component, dependency audit
- Immutable caching for registry JSON; fully static docs site
- End-to-end "agent adds a component" workflow: registry-item PR template, auto-changeset, auto-publish

## Upgrade backlog (evaluated 2026-07-11)

Findings from a dependency/pattern audit. Ordered by priority.

1. ✅ (2026-07-11) **Dependency drift vs consumers (high).** Workspace upgraded to the majors
   consumers receive: tailwind-merge 3.6, sonner 2.0, lucide-react 1.24, react-day-picker
   10.0 (calendar.tsx needed no changes — v10 only removed v8-era classNames aliases; we
   already use v9 names). **Decision: registry deps now carry version ranges** — build script
   resolves each bare name in `registry.ts` against `packages/registry/package.json`
   dependencies at build time (single source of truth; build fails on undeclared deps), so
   `/r/<name>.json` publishes e.g. `tailwind-merge@^3.6.0`. CLI: `init` base deps pinned to
   the same ranges, install args quoted on Windows (cmd.exe eats `^`). Full reproducibility
   (exact versions + checksums) still lands with Phase 5 `lorre.lock`.
2. ✅ (2026-07-11) **React 19 component style (medium).** All 31 pre-batch-4 components
   migrated in one sweep to plain functions + `data-slot` attributes (no more
   `forwardRef`/`ElementRef`/`displayName`); `"use client"` added on Radix-based files to
   match batch-4 convention. API break: `button` no longer exports `ButtonProps` (use
   `React.ComponentProps<typeof Button>`); combobox/date-picker take `ref` as a plain prop.
   Visual acceptance in www: calendar/date-picker (rdp 10), sonner toast (v2), dropdown,
   dialog, theme switch basic→dreamy→utilitarian + dark — zero console errors.
3. **CLI deps (low).** `commander` 13→15, `@clack/prompts` 0.9→1.x (hit 1.0), `zod` 3→4
   (build-time only). No user-facing behavior expected; batch with a normal CLI release.
4. **www deps (low).** `next` 15.1→16.x. Take it with a Phase 3.2/3.3 www branch, not alone,
   given the PR-per-www-change workflow.

Remaining: item 3 (CLI deps: commander 15, clack 1.x, zod 4 — batch with a normal CLI
release) and item 4 (next 16 — take with a Phase 3.2/3.3 www branch).

## Execution order

| # | Phase | Estimate |
|---|---|---|
| 1 | Phase 0 + `lorre.md` | ✅ done 2026-07-09 |
| 2 | Phase 1 (tokens + 3 themes) | ✅ done 2026-07-09 |
| 3 | Phase 4.1 (CLI `--json`, `search`, `info`) | ✅ done 2026-07-09 |
| 4 | Phase 2 (porting, continuous) | ~1 component/hour once patterns exist |
| 5 | Phase 3.1 ✅ done 2026-07-10; 3.2 (llms.txt) | remaining: 1 day |
| 6 | Phase 4.2 (`plan`/`apply`) | 2–3 days |
| 7 | Phase 5 + 3.3 | follows |

Phase 4.1 lands before mass porting so the porting itself can be agent-assisted.
