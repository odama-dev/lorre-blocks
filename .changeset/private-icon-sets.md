---
"lorre-blocks": minor
---

Private icon sets: the catalog can now carry a Lorre-only set whose artwork lives on an
authenticated npm registry rather than in this repo. `theme create --private` acknowledges
the choice — without it a private set is refused, so nobody wires a package into a project
that CI cannot install — and it writes only the scoped `<scope>:registry=` line into the
project `.npmrc`, never a token. Public surfaces (the `/icons` browser, the Theme Studio's
set picker, `/r/icons/index.json`) list the permissive sets only.
