<!-- Keep the sections that apply; delete the rest. -->

## What

<!-- One paragraph: what this PR ships and why. -->

## Registry item checklist (when adding/changing items)

- [ ] Source under `packages/registry/src/<kind>/<name>.tsx`, `@/lib/utils`-style imports
- [ ] Registered in `packages/registry/registry.ts` with full classification metadata
      (source / category / tags; license on ported items)
- [ ] `pnpm build:registry` passes (validation + deterministic output; regenerated
      `theme.css` committed — CI fails on drift)
- [ ] Demo added to `apps/www/components/demos/` and mapped — the demo-coverage test
      fails without one; docs page/sidebar/search/llms derive from the registry
- [ ] Renders correctly under all 3 themes (basic / dreamy / utilitarian), light + dark
- [ ] Honors `prefers-reduced-motion` (motion items)
- [ ] `pnpm test` green (includes the www render smoke suite)

## CLI checklist (when changing `packages/cli`)

- [ ] Changeset added (`pnpm changeset`) — patch for fixes, minor for new commands/flags
- [ ] `--json` contract holds: one JSON doc on stdout, no prompts, `{ok:false}` + exit 1
      on failure
- [ ] `--version` string in `src/index.ts` matches the queued release

## Verification

<!-- What you ran and what you observed (not just "tests pass"):
     e2e against a local registry, Playwright on the docs site, screenshots… -->
