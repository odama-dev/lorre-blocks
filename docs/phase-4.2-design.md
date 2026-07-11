# Phase 4.2 design — `lorre plan` / `lorre apply`

> Drafted 2026-07-11, after batch 6 completed the marketing block set (52 registry items).
> Status: **design locked enough to implement; not started.** Companion to
> [`PLAN.md`](./PLAN.md) Phase 4.2 and the sculpt-vs-create decision tree in
> [`lorre.md`](../lorre.md).

## Core decision: the CLI stays deterministic — the agent does the reasoning

The original one-liner ("`lorre plan --spec prd.md`") implied the CLI reads a free-form
PRD. The CLI has no LLM, and keyword-matching a PRD against tags would be a gimmick.
Instead, split the roles:

- **Agent** (Claude etc.): reads the PRD/IA/design direction, explores the registry with
  the existing `search`/`info` commands, and **writes a `plan.json`**.
- **CLI**: validates, resolves and executes plans. Deterministic, testable, no magic.

This matches how the rest of the CLI is built (agent-first = machine-readable and
predictable, not "AI inside").

## New commands

### `lorre plan check <plan.json> --json`
Read-only validation + resolution. Emits `{ok, plan, resolution, problems}`:
- schema-validate the plan (zod, same style as the registry build)
- verify the theme exists (against `/r/themes/index.json`)
- verify every `add` item exists; expand `registryDependencies` → `installOrder`
- union `npmDependencies` (versioned ranges, as published since 0.4.0)
- compute resolved target paths per file (reuse `info`'s logic)
- unknown items / unresolvable names → `problems` (exit 1), so an agent iterates
  until check passes before touching the filesystem

### `lorre apply <plan.json> --json`
Executes a checked plan in one run: `init` semantics for the theme (inject/replace the
theme block, write utils, components.json with `theme` recorded) + `add` semantics for
the item list (skip existing, `--overwrite` to replace) + one package-manager pass.
- Re-runs `check` first; refuses on problems.
- Records the applied plan to `lorre.plan.json` in the project root (input to future
  `diff`/Phase 5 `lorre.lock`).
- Idempotent: re-applying the same plan is a no-op apart from reported skips.

## `plan.json` schema (v1)

```jsonc
{
  "$schema": "https://lorre-blocks.dev/plan.schema.json",
  "name": "acme-landing",                  // required, kebab-case
  "theme": { "name": "dreamy" },           // must exist in the registry
  "add": ["navbar", "hero", "features", "pricing", "faq", "cta", "footer"],
  "pages": [                               // optional, documentation-only in v1:
    { "path": "/", "blocks": ["navbar", "hero", "features", "pricing", "faq", "cta", "footer"] }
  ],                                       // apply does NOT scaffold pages in v1
  "tokenOverrides": {                      // optional, v1 scope: semantics only
    "primary": "accent-10"                 // semantic -> scale-step reference
  },
  "gaps": [                                // agent-reported, apply passes them through
    { "need": "logo carousel", "decision": "create", "suggestion": "blocks/logos" }
  ],
  "notes": "free-form agent rationale"
}
```

v1 scope fences:
- **`pages` is metadata** (helps humans/agents see the composition); apply does not
  generate page files — framework-specific scaffolding is a later phase.
- **`tokenOverrides` limited to semantic → scale-step remaps**, emitted as a second CSS
  block wrapped in `/* lorre-blocks overrides start|end */` markers right after the theme
  block (same replace-in-place mechanics as `theme apply`; `.dark` re-declaration rule
  from Phase 1 applies — reuse `themeToCss` internals, don't handroll).
- `gaps` never block `apply`; they ride along into `lorre.plan.json` so the follow-up
  work is recorded where the next agent will look.

## Implementation notes

- New files: `src/commands/plan.ts` (`check` subcommand), `src/commands/apply.ts`,
  `src/utils/plan.ts` (schema + resolution shared by both). zod is already a CLI-adjacent
  dep (registry build) but NOT a CLI dep — either add `zod` to the CLI (fine, v4 is
  small) or hand-roll validation like `config.ts` does; prefer zod for error quality.
- Reuse, don't duplicate: `resolveTree`/install-order logic from `add`, target-path logic
  from `info`, theme-block injection from `init`/`theme apply`.
- Windows: keep every spawn quoted (cmd.exe `^` gotcha, fixed in 0.4.0) and remember the
  nested-background npm-install hang — e2e tests must run the CLI in the foreground.
- Tests: schema fixtures (valid/invalid plans), `check` against a fixture registry
  (existing test harness has one), `apply` e2e into a temp dir asserting written files +
  `lorre.plan.json` + idempotent re-run. Target: keep the "one JSON doc on stdout"
  contract — plan/apply get the same output.ts treatment as everything else.
- Ships as **CLI 0.5.0** (minor — new commands), changeset required.
- Acceptance (definition of done): an agent chain
  `search → info → write plan.json → plan check → apply` produces a themed Vite app with
  a full marketing page's blocks installed, in one `apply`, verified on Windows.

## Explicitly out of scope for 4.2

- Page/file scaffolding from `pages` (needs a framework story)
- Token overrides beyond semantic remaps (raw OKLCH edits, new scales → Phase 5 era)
- `lorre plan generate` (LLM-in-CLI) — not planned at all; agents own the reasoning
- MCP server (`@lorre-blocks/mcp`) stays Phase 4.3
