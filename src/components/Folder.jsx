/**
 * Presentational folder card — static only, no pointer/drag handlers.
 */
export default function Folder({
  id,
  tab,
  body,
  variant = "default",
  hideTab = false,
  style,
}) {
  const className = [
    "folder",
    variant === "main" && "folder--main",
    variant === "empty" && "folder--empty",
    variant === "tagline" && "folder--tagline",
    hideTab && "folder--no-tab",
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div
      className={className}
      data-id={id}
      role="group"
      aria-label={tab || "Folder"}
      style={style}
    >
      {hideTab ? (
        <div className="folder__tab folder__tab--spacer" aria-hidden="true" />
      ) : (
        <div className="folder__tab">{tab}</div>
      )}
      {body ? <div className="folder__body">{body}</div> : null}
    </div>
  )
}
