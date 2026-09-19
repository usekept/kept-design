import { KeptApp } from "./kept/KeptApp.tsx"
import { currentPath } from "./lib/path.js"
import { SystemMapPage } from "./pages/SystemMap.jsx"

// Every address is a Kept address, as in kept-ui. /map stays on the legacy product page
// until kept-ui's KeptMap is recreated.
export default function App() {
  if (currentPath() === "/map") return <SystemMapPage />
  return <KeptApp />
}
