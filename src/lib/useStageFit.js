import { useLayoutEffect, useState } from "react"
import { FOCUS, FRAME_H, FRAME_W, NARROW_MAX_W } from "../composition.js"

/** Beyond this the comp just gets gratuitously large, so cap it and centre. */
const MAX_SCALE = 1.15

function measure() {
  const vw = window.innerWidth
  const vh = window.innerHeight

  if (vw < NARROW_MAX_W) {
    const scale = vw / FOCUS.w
    return {
      narrow: true,
      scale,
      x: -FOCUS.x * scale,
      y: -FOCUS.y * scale,
      /** Lowest design-space row still on screen, so the stack can size itself. */
      visibleBottom: FOCUS.y + vh / scale,
    }
  }

  // Fit both axes so the full comp — tagline included — always stays in view.
  const scale = Math.min(vw / FRAME_W, vh / FRAME_H, MAX_SCALE)
  return {
    narrow: false,
    scale,
    x: (vw - FRAME_W * scale) / 2,
    y: 0,
    visibleBottom: vh / scale,
  }
}

/** Maps the comp onto the viewport, remeasuring on resize. */
export default function useStageFit() {
  const [fit, setFit] = useState(measure)

  useLayoutEffect(() => {
    const update = () => setFit(measure())
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return fit
}
