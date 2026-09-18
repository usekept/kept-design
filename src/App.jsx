import { SiteMasthead } from "./components/SiteMasthead.jsx"
import { siteConfig } from "./config/site.js"
import { SystemMapPage } from "./pages/SystemMap.jsx"

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "")
  if (path === "/map") return <SystemMapPage />
  return <HomePage />
}

function HomePage() {
  return (
    <div className="page">
      <SiteMasthead
        name={siteConfig.name}
        description={siteConfig.description}
        meta={siteConfig.status}
        href={siteConfig.href}
      />
      <main className="main">
        <div className="intro">
          <span className="status-pill">EARLY DEVELOPMENT</span>
          <p>
            Local-first visual reference database — capture references once,
            give them structure and context, and reliably find them again.
          </p>
          <pre className="project-context">{`DF.4.2    VISUAL WORKING SURFACE

RG.001    REFERENCE SYSTEM

STATUS    ACTIVE
STUDIO    `}<a className="owner-link" href="https://onwend.com/">ONWEND</a></pre>
        </div>
      </main>
    </div>
  )
}
