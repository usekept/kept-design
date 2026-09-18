import { SiteMasthead } from "./components/SiteMasthead.jsx"
import { siteConfig } from "./config/site.js"
import { currentPath } from "./lib/path.js"
import { LibraryPage } from "./pages/Library.jsx"
import { SystemMapPage } from "./pages/SystemMap.jsx"

export default function App() {
  const path = currentPath()
  if (path === "/map") return <SystemMapPage />
  if (path === "/library") return <LibraryPage />
  return <HomePage />
}

const fundamentalActions = [
  ["Capture", "Create a record."],
  ["Index", "Give it structure."],
  ["Annotate", "Add meaning."],
  ["Organize", "Put it into collections / relationships."],
  ["Query", "Search and filter it."],
  ["Retrieve", "Actually fucking find it again."],
  ["Connect", "Relate one reference to another."],
]

function HomePage() {
  return (
    <div className="page">
      <SiteMasthead
        name={siteConfig.name}
        meta={siteConfig.status}
        href={siteConfig.href}
        badge="EARLY DEVELOPMENT"
      />
      <main className="main">
        <div className="intro">
          <p>
            <strong>{siteConfig.description}</strong>
            <br />
            A structured system for collecting, organizing, contextualizing,
            and retrieving visual references.
          </p>
          <p className="intro-link">
            <a href="/library">Open the library</a>
          </p>
          <section className="actions" aria-label="Fundamental actions">
            <dl>
              {fundamentalActions.map(([action, meaning]) => (
                <div key={action}>
                  <dt>{action}</dt>
                  <dd>{meaning}</dd>
                </div>
              ))}
            </dl>
          </section>
          <dl className="project-context">
            <div>
              <dt>DF.4.2</dt>
              <dd>VISUAL WORKING SURFACE</dd>
            </div>
            <div>
              <dt>RG.001</dt>
              <dd>REFERENCE SYSTEM</dd>
            </div>
            <div className="project-context-group">
              <div>
                <dt>STATUS</dt>
                <dd className="status-active">ACTIVE</dd>
              </div>
              <div>
                <dt>STUDIO</dt>
                <dd><a className="owner-link" href="https://onwend.com/">ONWEND</a></dd>
              </div>
            </div>
          </dl>
        </div>
      </main>
    </div>
  )
}
