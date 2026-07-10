/**
 * Runs before paint: restores dark mode and the picked theme from localStorage.
 * Non-basic theme CSS is cached in localStorage by theme-controls so reloads
 * don't flash the basic theme while /r/themes/<name>.json is fetched.
 */
const script = `
(function () {
  try {
    if (localStorage.getItem("lorre-mode") === "dark") {
      document.documentElement.classList.add("dark")
    }
    var theme = localStorage.getItem("lorre-theme")
    var css = localStorage.getItem("lorre-theme-css")
    if (theme && theme !== "basic" && css) {
      var style = document.createElement("style")
      style.id = "lorre-theme-override"
      style.textContent = css
      document.head.appendChild(style)
    }
  } catch (e) {}
})()
`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
