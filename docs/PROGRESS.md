# Lorre Blocks — Progress Log

Running log, newest entry first. One entry per working session; record decisions, what
shipped, and what's next so any human or agent can pick up from here.

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
