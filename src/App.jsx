import { KeptApp } from "./kept/KeptApp.tsx"
import { pathToKeptRoute } from "./kept/href.ts"

export default function App() {
  return <KeptApp route={pathToKeptRoute()} />
}
