---
"lorre-blocks": minor
---

New `update [names...]` command: pulls registry updates for installed items using
`lorre.lock` to stay safe — it only rewrites files whose content still hashes to what
an install wrote. Local edits are kept when the registry is unchanged; diverged,
untracked or locally deleted files are skipped with a warning unless `--force`. New
registry dependencies an update introduces are added automatically, and missing or
stale lock hashes are refreshed for files that match the registry.
