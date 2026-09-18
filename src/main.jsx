import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@fontsource-variable/geist"
import "@fontsource-variable/geist-mono"
import App from "./App.jsx"
import { applyTheme, getTheme } from "./kept/theme.ts"
import "./kept/tokens.css"

applyTheme(getTheme())

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
