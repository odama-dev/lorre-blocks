# lorre-icons

Lorre's icon set — **585 icons in 6 styles**, drawn in-house and MIT licensed.
Browse them at [lorre-blocks.vercel.app/icons](https://lorre-blocks.vercel.app/icons).

```bash
npm i lorre-icons
```

```tsx
import { ArrowTop, Bookmark } from "lorre-icons/stroke-1.5"

<ArrowTop className="size-5" />
```

Icons are plain SVG components: they take every `svg` prop, draw with
`currentColor`, and carry no size of their own — set it with a class or
`width`/`height` so they inherit type scale and color like text.

## The six styles

```
stroke-1   stroke-1.5   stroke-2
filled-1   filled-1.5   filled-2
```

Each is its own entry point, so importing one style never pulls the others:

```tsx
import { Bookmark } from "lorre-icons/filled-2"
```

Figma models each icon as a 30-variant matrix — `filled` × `stroke` × `radius`
× `join` — and every variant is **different path geometry**, not the same path
under different attributes. The designer insets a circle as its stroke thins so
the outer edge stays on the 24px bound, and redraws corners for miter vs round.
No runtime prop can reproduce that, so each style we ship is exported
separately. `radius` and `join` are pinned to the house values; stroke weight
and fill are the axes that actually vary in use.

## Names

Components are PascalCase of the icon's slug (`arrow-top` → `ArrowTop`). The
Figma file has 48 duplicate names; repeats get a `_2` suffix (`ArrowTop_2`)
rather than a bare digit, because icons genuinely called "share 2" already
exist and `Share2` would be ambiguous.

`lorre-icons/catalog.json` lists every icon with its slug, component name,
category and search keywords — that is what the docs browser and the CLI read.

## Provenance

Generated from the "All Icon" Figma file by the export pipeline in the
[lorre-icons](https://github.com/odama-dev/lorre-icons) repo, which writes into
`packages/icons/src` here. **Do not hand-edit `src/` — the next export
overwrites it.** Fix the artwork in Figma and re-export.
