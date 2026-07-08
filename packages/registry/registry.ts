import type { RegistryItem } from "./src/schema"

export const registry: RegistryItem[] = [
  {
    name: "utils",
    type: "registry:lib",
    description: "cn() helper for merging Tailwind class names.",
    dependencies: ["clsx", "tailwind-merge"],
    files: [{ path: "lib/utils.ts", type: "registry:lib" }],
  },
  {
    name: "button",
    type: "registry:ui",
    description:
      "Displays a button or a component that looks like a button. Supports variants, sizes, and asChild.",
    dependencies: ["@radix-ui/react-slot", "class-variance-authority"],
    registryDependencies: ["utils"],
    files: [{ path: "ui/button.tsx", type: "registry:ui" }],
  },
  {
    name: "input",
    type: "registry:ui",
    description: "A styled text input field.",
    registryDependencies: ["utils"],
    files: [{ path: "ui/input.tsx", type: "registry:ui" }],
  },
]
