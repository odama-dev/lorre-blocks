---
"lorre-blocks": minor
---

Reproducible dependency installs: registry items now publish npm deps with version ranges (resolved from the registry workspace's own package.json, so consumers install exactly the majors the registry is tested against — tailwind-merge 3, sonner 2, lucide-react 1, react-day-picker 10). `init` installs its base deps (clsx, tailwind-merge, class-variance-authority, tw-animate-css) with matching ranges, and install args are quoted on Windows so `^` ranges survive cmd.exe.
