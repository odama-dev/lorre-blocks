---
"lorre-blocks": minor
---

Agent-readable CLI baseline. Every command accepts `--json`, which emits exactly one JSON document on stdout (`{ ok: true, ... }`, or `{ ok: false, error }` with exit code 1) and never prompts — spinners, prose and package-manager output are all suppressed, so an agent can parse stdout directly. Adds `search <query>` with `--category` / `--source` / `--theme` / `--type` / `--limit` facets, and `info <name>` which reports an item's metadata, transitive install order, npm dependencies and the exact paths its files would be written to.
