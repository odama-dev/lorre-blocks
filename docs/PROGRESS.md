# Lorre Blocks — Progress Log

Running log, newest entry first. One entry per working session; record decisions, what
shipped, and what's next so any human or agent can pick up from here.

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
