import { StrictMode, Suspense, lazy } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.jsx"
import { siteConfig } from "./config/site.js"
import "./index.css"

// Layout overlay for inspecting the grid. Dev only, so it never ships.
const KeptGuideframe = import.meta.env.DEV ? lazy(() => import("./dev/KeptGuideframe.jsx")) : null

document.documentElement.style.setProperty("--accent", siteConfig.accent)

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    {KeptGuideframe && (
      <Suspense fallback={null}>
        <KeptGuideframe />
      </Suspense>
    )}
  </StrictMode>,
)
