/**
 * Runs before paint: restores the visitor's dark/light choice from localStorage
 * so there's no flash of the wrong mode on load.
 */
const script = `
(function () {
  try {
    if (localStorage.getItem("lorre-mode") === "dark") {
      document.documentElement.classList.add("dark")
    }
  } catch (e) {}
})()
`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
