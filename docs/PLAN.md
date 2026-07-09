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

## Phase 1 — Design tokens layer + theme system

- Token architecture in `packages/registry/src/tokens/`:
  - **color** — Radix-style 1–12 scales + semantic aliases (`accent`, `neutral`, `danger`, `success`, `warning`)
  - **typography** — font stacks, type scale, line-height, letter-spacing
  - **spacing/layout** — spacing scale, containers, breakpoints, grid presets
  - **radius / shadow** — surface tokens
  - **motion** — durations, easings (shared with the `motion` category)
- One source, two outputs per token set: Tailwind v4 `@theme` CSS **and** W3C DTCG JSON (`/r/tokens/<name>.json`)
- Theme system: theme = token value set; themes can extend other themes.
  Ship `basic`, `dreamy`, `utilitarian` (`/r/themes/<name>.json`)
- CLI: `lorre init --theme <name>`, `lorre theme apply <name>` (needs CLI publish)
- **Acceptance:** switching a consumer project's theme is one CLI command, zero component edits.

## Phase 2 — Component porting (continuous)

Order: (1) core primitives ~20 (accordion, dialog, dropdown, popover, tooltip, select,
checkbox, radio, switch, tabs, toast…), (2) form & data (table, form, combobox, date picker,
badge, avatar, card), (3) blocks (hero, pricing, FAQ, CTA, footer), (4) motion/interaction
(Magic UI / React Bits style).

Rules: shadcn/Radix/Magic UI are MIT → port with `license: "MIT"` + correct `source`.
**Align UI → rewrite from scratch**, `source: "lorre"`. Every port is rewired onto Lorre
semantic tokens and must render correctly under all 3 themes before it merges.

## Phase 3 — Docs app (`apps/www`)

- 3.1 Docs layout: hierarchical sidebar (Getting Started → Tokens → Components → Blocks → Motion),
  component pages with Preview/Code tabs + `lorre add` snippet + props table, ⌘K search
- 3.2 Agent readability: `llms.txt` + `llms-full.txt`, raw-markdown twin per docs page
- 3.3 Landing page (last): Radix-style single-section with theme-switching carousel; simple placeholder until then
- Workflow: every www change ships via feature branch → PR → owner merge (Vercel Hobby constraint)

## Phase 4 — Agent-friendly CLI

- 4.1 Machine-readable baseline: `--json` on all commands, fully non-interactive `init`,
  `lorre search <query> --json`, `lorre info <name> --json`
- 4.2 Build-from-spec: `lorre plan --spec prd.md --json` (theme choice + add-list + token
  overrides + gap list) and `lorre apply plan.json`. Gap handling follows the sculpt-vs-create
  decision tree in `lorre.md`; new items ship as patch releases via existing CI.
- 4.3 (Stretch) `@lorre-blocks/mcp` MCP server: `search_registry`, `get_component`, `apply_theme`

## Phase 5 — Security, performance, automation hardening

- `lorre.lock` in consumer projects (version + checksum per installed item) → accurate `diff`
- CI: registry validation on every PR, render-test per component, dependency audit
- Immutable caching for registry JSON; fully static docs site
- End-to-end "agent adds a component" workflow: registry-item PR template, auto-changeset, auto-publish

## Execution order

| # | Phase | Estimate |
|---|---|---|
| 1 | Phase 0 + `lorre.md` | ✅ done 2026-07-09 |
| 2 | Phase 1 (tokens + 3 themes) | 2–3 days |
| 3 | Phase 4.1 (CLI `--json`, `search`, `info`) | 1–2 days |
| 4 | Phase 2 (porting, continuous) | ~1 component/hour once patterns exist |
| 5 | Phase 3.1–3.2 (docs + tokens pages + llms.txt) | 3–4 days |
| 6 | Phase 4.2 (`plan`/`apply`) | 2–3 days |
| 7 | Phase 5 + 3.3 | follows |

Phase 4.1 lands before mass porting so the porting itself can be agent-assisted.
