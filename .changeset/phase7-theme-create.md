---
"lorre-blocks": minor
---

Custom themes (Phase 7.3): `theme create` generates a tailored design system from a
`lorre.theme.json` definition and/or flags (`--accent "#5B6CFF"`, `--neutral`,
`--secondary`, `--radius xl|0.75rem`, `--font-sans Geist`, `--type-base/--type-ratio`,
`--scaling 105`, `--icons phosphor:duotone`) — the token engine is bundled, so CSS is
generated locally and injected into the global stylesheet. `theme apply` without a name
re-applies the local `lorre.theme.json`; new `theme show [--json]` prints the resolved
design system. `plan.json` accepts an inline theme definition object, validated against
the same contract.
