# lorre-icons

## 0.1.0

### Minor Changes

- ab264d8: The house icon set is public: **585 icons in 6 stroke/fill styles**, MIT licensed, published
  as `lorre-icons` and browsable at `/icons` alongside Lucide, Radix, Phosphor and Heroicons.
  `theme create --icons lorre:stroke-1.5` installs it like any other set.

  This replaces the private-set mechanism shipped a day earlier. `IconSetInfo.private`,
  `IconSetInfo.registry`, `PUBLIC_ICON_SETS`, `isPrivateIconSet` and the CLI's `--private`
  flag are removed — with the artwork public there is nothing left for them to gate, and the
  flag never reached a released version. Anyone who wrote `--private` into a script can drop
  it; the set installs from public npm now.
