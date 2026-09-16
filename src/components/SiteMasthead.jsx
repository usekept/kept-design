export function SiteMasthead({ name, description, meta, href, secondaryMeta }) {
  return (
    <header className="site-masthead">
      <div className="masthead-identity">
        <h1 className="masthead-name">
          {href ? <a href={href}>{name}</a> : name}
        </h1>
        <p>{description}</p>
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
