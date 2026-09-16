import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.jsx"
import { siteConfig } from "./config/site.js"
import "./index.css"

document.documentElement.style.setProperty("--accent", siteConfig.accent)

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
