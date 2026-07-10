import { Toaster as Sonner, type ToasterProps } from "sonner"

/**
 * Toast host styled with Lorre tokens. Render once near the app root, then
 * call `toast(...)` from "sonner" anywhere. Pass `theme="dark"` (or wire it
 * to your theme switcher) when rendering inside a `.dark` subtree.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--popover)",
          "--success-text": "var(--success)",
          "--error-bg": "var(--popover)",
          "--error-text": "var(--destructive)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
export { toast } from "sonner"
