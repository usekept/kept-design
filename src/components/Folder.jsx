import { folderPath } from "../lib/folderPath.js"

/**
 * One folder: its outline plus whatever copy sits inside it. The label and body
 * are children of the same positioned wrapper so they travel with it when dragged.
 *
 * The stroke straddles the path, so the SVG is left overflowing rather than
 * padded — that keeps the folder's box identical to its design coordinates.
 */
export default function Folder({ folder, offset, zIndex, handlers, children }) {
  const { id, x, y, w, h, tabW, label, accent } = folder
  const dx = offset?.x ?? 0
  const dy = offset?.y ?? 0

  return (
    <div
      className="folder"
      data-id={id}
      role="group"
      aria-label={label.text}
      style={{ left: x + dx, top: y + dy, width: w, height: h, zIndex, "--ink": accent }}
      onPointerDown={handlers.onPointerDown(id)}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={handlers.onPointerUp}
      onPointerCancel={handlers.onPointerUp}
    >
      <svg
        className="folder__outline"
        viewBox={`0 0 ${w} ${h}`}
        width={w}
        height={h}
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d={folderPath(w, h, tabW)}
          fill="var(--folder)"
          stroke="var(--ink)"
          strokeWidth="1.45"
          strokeLinejoin="round"
        />
      </svg>

      <span className="label" style={{ left: label.dx, top: label.dy }}>
        {label.text}
      </span>

      {children}
    </div>
  )
}
