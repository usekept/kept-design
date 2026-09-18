import { currentPath } from "../lib/path.js"

const NAV = [
  { href: "/", label: "Landing" },
  { href: "/library", label: "Library" },
  { href: "/map", label: "Map" },
]

export function SiteMasthead({ name, description, meta, href, secondaryMeta, badge, compact = false }) {
  const path = currentPath()

  return (
    <header className={`site-masthead${compact ? " is-compact" : ""}`}>
      <div className="masthead-identity">
        <div className="masthead-name-row">
          <h1 className="masthead-name">
            {href ? <a href={href}>{name}</a> : name}
          </h1>
          {badge ? <span className="status-pill">{badge}</span> : null}
        </div>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="masthead-meta">
        <nav className="masthead-nav" aria-label="Site">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={path === item.href ? "is-current" : undefined}
              aria-current={path === item.href ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        {meta ? <p>{meta}</p> : null}
        {secondaryMeta ? <p>{secondaryMeta}</p> : null}
      </div>
    </header>
  )
}
