---
"lorre-blocks": patch
---

Internal dependency upgrades: commander 13→15, @clack/prompts 0.9→1.7 (zod 3→4 in the registry build tooling). No user-facing behavior changes, but the CLI now declares `engines.node >=22.12.0` (required by commander 15; Node 20 is EOL).
