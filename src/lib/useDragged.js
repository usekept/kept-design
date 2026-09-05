import { useCallback, useRef, useState } from "react"

/**
 * Pointer-drag offsets for the folders, in design units. Dragging is only wired
 * up on narrow viewports; the wide comp is a fixed composition.
 *
 * `scale` converts pointer travel in CSS pixels back into design units, so a
 * folder tracks the finger exactly however the stage is scaled.
 */
export default function useDragged(scale) {
  const [offsets, setOffsets] = useState({})
  const [front, setFront] = useState([])
  const drag = useRef(null)

  const onPointerDown = useCallback(
    (id) => (event) => {
      event.currentTarget.setPointerCapture(event.pointerId)
      drag.current = {
        id,
        pointerId: event.pointerId,
        fromX: event.clientX,
        fromY: event.clientY,
        base: offsets[id] ?? { x: 0, y: 0 },
      }
      setFront((order) => [...order.filter((i) => i !== id), id])
    },
    [offsets],
  )

  const onPointerMove = useCallback(
    (event) => {
      const d = drag.current
      if (!d || d.pointerId !== event.pointerId) return
      setOffsets((current) => ({
        ...current,
        [d.id]: {
          x: d.base.x + (event.clientX - d.fromX) / scale,
          y: d.base.y + (event.clientY - d.fromY) / scale,
        },
      }))
    },
    [scale],
  )

  const onPointerUp = useCallback((event) => {
    if (drag.current?.pointerId === event.pointerId) drag.current = null
  }, [])

  /** Reset when leaving narrow mode, so the wide comp is never left displaced. */
  const reset = useCallback(() => {
    setOffsets({})
    setFront([])
  }, [])

  return { offsets, front, reset, handlers: { onPointerDown, onPointerMove, onPointerUp } }
}
