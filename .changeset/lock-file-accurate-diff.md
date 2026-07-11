---
"lorre-blocks": minor
---

`lorre.lock`: `init`, `add` and `apply` now record what they install — per file, the
sha256 of the content as written, plus the registry item checksum. `diff` uses it to
tell you *who* changed a modified file (`local edits`, `registry updated`, or
`diverged`; `cause` in `--json`), and no-arg `diff` now covers every installed item
from the lock — blocks, motion and lib included — instead of only scanning the ui
directory. Projects without a lock keep the old behavior.
