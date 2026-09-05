import { useEffect } from "react"
import BrokenLines from "./components/BrokenLines.jsx"
import Folder from "./components/Folder.jsx"
import useDragged from "./lib/useDragged.js"
import useStageFit from "./lib/useStageFit.js"
import {
  FOCUS,
  FRAME_H,
  FRAME_W,
  LEDE,
  TAGLINE,
  WORDMARK,
  WORDMARK_W,
  layoutFolders,
} from "./composition.js"

export default function App() {
  const { narrow, scale, x, y, visibleBottom } = useStageFit()
  const { offsets, front, reset, handlers } = useDragged(scale)

  // The wide comp is a fixed composition, so drop any dragging done on mobile.
  useEffect(() => {
    if (!narrow) reset()
  }, [narrow, reset])

  const folders = layoutFolders({ narrow, visibleBottom })
  const tagline = narrow ? TAGLINE.mobile : TAGLINE

  // On mobile the comp is cropped, so centre the wordmark on the visible region.
  const wordmarkLeft = narrow ? FOCUS.x + FOCUS.w / 2 - WORDMARK_W / 2 : WORDMARK.x

  return (
    <main
      className={`stage${narrow ? " stage--draggable" : ""}`}
      style={{
        width: FRAME_W,
        height: FRAME_H,
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
      }}
    >
      <h1 className="wordmark" style={{ left: wordmarkLeft, top: WORDMARK.y }}>
        {WORDMARK.text}
      </h1>

      {folders.map((folder, i) => {
        const lifted = front.indexOf(folder.id)
        return (
          <Folder
            key={folder.id}
            folder={folder}
            offset={offsets[folder.id]}
            zIndex={lifted === -1 ? i : folders.length + lifted}
            draggable={narrow}
            handlers={handlers}
          >
            {folder.id === "personal" && (
              <p className="lede" style={{ left: LEDE.dx, top: LEDE.dy }}>
                <BrokenLines lines={LEDE.lines} text={LEDE.text} />
              </p>
            )}
            {folder.id === tagline.owner && (
              <p className="tagline" style={{ left: tagline.dx, top: tagline.dy }}>
                <BrokenLines lines={TAGLINE.lines} text={TAGLINE.text} />
              </p>
            )}
          </Folder>
        )
      })}
    </main>
  )
}
