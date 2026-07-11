---
"lorre-blocks": minor
---

Phase 4.2: `plan check` and `apply`. An agent (or human) authors a `plan.json`
(name, theme, add-list, optional pages/tokenOverrides/gaps — see
docs/phase-4.2-design.md); `lorre-blocks plan check plan.json` validates it and
resolves it against the registry read-only (all problems collected in one pass),
and `lorre-blocks apply plan.json` executes it: components.json + theme block +
semantic token overrides + all items + one package-manager pass, recording
`lorre.plan.json`. Apply is idempotent; `--overwrite` replaces existing files.
