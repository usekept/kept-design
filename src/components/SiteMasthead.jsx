export function SiteMasthead({ name, description, meta, href, secondaryMeta, badge }) {
  return (
    <header className="site-masthead">
      <div className="masthead-identity">
        <div className="masthead-name-row">
          <h1 className="masthead-name">
            {href ? <a href={href}>{name}</a> : name}
          </h1>
          {badge ? <span className="status-pill">{badge}</span> : null}
        </div>
        {description ? <p>{description}</p> : null}
      </div>
      {meta || secondaryMeta ? (
        <div className="masthead-meta">
          {meta ? <p>{meta}</p> : null}
          {secondaryMeta ? <p>{secondaryMeta}</p> : null}
        </div>
      ) : null}
    </header>
  )
}
