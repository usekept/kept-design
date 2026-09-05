import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "gen-interface-jp/400.css"
import "gen-interface-jp/500.css"
import "gen-interface-jp/600.css"
import "gen-interface-jp/700.css"
import "gen-interface-jp/display-700.css"
import App from "./App.jsx"
import "./index.css"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
