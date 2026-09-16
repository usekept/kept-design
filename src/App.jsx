import { SiteMasthead } from "./components/SiteMasthead.jsx"
import { siteConfig } from "./config/site.js"

export default function App() {
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
            Local-first visual reference canvas — paste images, arrange them,
            annotate lightly, and keep working without the weight of a full design tool.
          </p>
          <pre className="project-context">{`DF.4.2    PROJECT CONTEXT

RG.018    REFERENCE SYSTEM
          CREATED 16 SEP 2026

STATUS    ACTIVE
OWNER     WADE`}</pre>
        </div>
      </main>
    </div>
  )
}
