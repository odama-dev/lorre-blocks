# Lorre Design System (`lorre.md`)

> **Status: alpha, internal use.** This file is the working reference — the "Lorre Skill" —
> for building anything in this repo, by humans or agents. It is deliberately kept separate
> from shadcn / Align UI / Magic UI conventions and will be updated as the system matures.
> When this file and old habits disagree, this file wins.

## What Lorre Blocks is

A design token + component registry in the spirit of Radix (token/theme architecture) with
shadcn-style distribution (a CLI copies source into the consumer project). It serves Lorre's
full range of work: professional dashboards, enterprise websites, and Awwwards-level creative
sites — which is why every item in the registry is classified (see below) instead of living
in one flat list.

- **Registry host:** https://lorre-blocks.vercel.app (`/r/index.json`, `/r/manifest.json`, `/r/<name>.json`, `/r/theme.json`)
- **CLI:** `lorre-blocks` on npm (`init`, `add`, `list`, `diff`)
- **Monorepo:** `packages/registry` (source of truth) · `packages/cli` · `apps/www` (docs + registry host)

## Classification system (registry schema v2)

Every registry item carries four classification axes. All of them are validated at build
time (`pnpm build:registry` fails on missing/invalid metadata).

| Axis | Field | Values | Notes |
|---|---|---|---|
| 1. Source | `source` | `shadcn` \| `magicui` \| `radix` \| `lorre` | Origin library. Ported code keeps its source and **must** carry `license`. Code written from scratch (including Align UI-inspired rewrites) is `lorre`. |
| 2. Theme | `themes` | `basic` \| `dreamy` \| `utilitarian` | Which themes the item is designed for. **Omitted = theme-agnostic** (works with every theme). Most components should be theme-agnostic; only theme-specific blocks/motion set this. |
| 3. Category | `category` | `token` \| `component` \| `block` \| `motion` \| `icon` \| `illustration` \| `asset` \| `lib` | Functional grouping. `motion` = React Bits-style interaction pieces (SVG, 3D, scroll…). `asset` = Lottie/Rive files. |
| 4. Token type | `tokenType` | `color` \| `typography` \| `spacing` \| `layout` \| `radius` \| `shadow` \| `motion` | Required when `category` is `token`, absent otherwise. |

Plus: `tags` (free-form keywords — write them for search, agents rely on them),
`description` (required, ≥ 20 chars, written for an agent deciding whether to use the item),
and `checksum` (sha256, generated at build time — never hand-written).

## Design rules

1. **Semantic tokens only.** Components never hardcode colors, radii, shadows, font sizes.
   They reference the Tailwind v4 theme variables from `packages/registry/src/styles/theme.css`
   (Phase 1 will expand these into full Radix-style scales). This is what makes themes swappable.
2. **Theme = token values, never component code.** A theme (`basic`, `dreamy`, `utilitarian`)
   is a set of token value overrides. If you need to fork a component to make a theme work,
   the component's tokens are wrong — fix the tokens.
3. **Token format:** CSS (Tailwind v4 `@theme`) for consumption, W3C DTCG JSON for tooling
   and agents. Both are emitted from one source (Phase 1).
4. **Ported code keeps its accent, not its tokens.** When porting from shadcn/Magic UI/Radix,
   rewire all styling onto Lorre tokens. The port is done when the component renders correctly
   under all three themes.
5. **Align UI is reference-only.** Its license is not open — never copy its code. Rewrite
   from scratch, mark `source: "lorre"`.

## Adding a registry item

1. Write source under `packages/registry/src/<kind>/<name>.tsx`
   (`ui/`, `lib/`, `blocks/`, `motion/`, `tokens/`…). Use `@/lib/utils`-style imports —
   the CLI rewrites them for the consumer project.
2. Register it in `packages/registry/registry.ts` with **full classification metadata**.
3. `pnpm build:registry` — must pass validation (kebab-case name, description length,
   license on ported items, resolvable `registryDependencies`, no duplicate names).
4. Add a docs page under `apps/www/app/docs/` (Phase 3 layout).
5. Ship (see release flow below).

### Decision tree: sculpt vs. create (for agents resolving a PRD gap)

1. Does an item with matching `category` + `tags` exist? → use it.
2. Can an existing basic component be adapted with token overrides / variants ("sculpted")? → sculpt it; do **not** create a new item.
3. Nothing fits? → create a new item following the steps above, ship it as a patch release, then consume it.

## Release flow (important — split by area)

- **`packages/cli` / `packages/registry` changes** → commit to `master`, push directly.
  Publishing the CLI needs a changeset (`pnpm changeset`); release CI auto-publishes on master.
- **`apps/www` changes** → feature branch → PR → repo owner merges. The Vercel Hobby plan
  blocks collaborator-triggered deploys, so only owner-merged changes go live.
- Generated registry JSON (`apps/www/public/r/`) is **gitignored** — the www `prebuild` script
  regenerates it on every deploy, so registry changes go live with the next www deploy.

## Current registry contents

Tokens/themes: Tailwind v4 base theme (`theme.css`) — Radix-style scales land in Phase 1.
Components: `button`, `input` (+ `utils` lib). Porting queue and roadmap live in `docs/PLAN.md`;
progress log in `docs/PROGRESS.md`.
