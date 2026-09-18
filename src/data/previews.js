/**
 * Solid-color stand-ins for fixture assets.
 * Imported by fixtures only — never by UI.
 *
 * @param {string} color
 * @returns {string}
 */
export function swatch(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 600" width="480" height="600"><rect width="480" height="600" fill="${color}"/></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const PALETTE = [
  "#F04452", // Red
  "#FF9F1A", // Orange
  "#FFD84A", // Yellow
  "#20C76A", // Green
  "#2EC5E8", // Cyan
  "#4B73FF", // Blue
  "#8B5CF6", // Violet
  "#E94BFF", // Magenta
]

/**
 * @param {number} index
 * @returns {string}
 */
function tone(index) {
  return PALETTE[index % PALETTE.length]
}

export const previews = {
  bazaar: swatch(tone(0)),
  grotesk: swatch(tone(1)),
  ando: swatch(tone(2)),
  cadmium: swatch(tone(3)),
  braun: swatch(tone(4)),
  braunDetail: swatch(tone(5)),
  braunBack: swatch(tone(6)),
  stalker: swatch(tone(7)),
  binding: swatch(tone(8)),
  subway: swatch(tone(9)),
  perriand: swatch(tone(10)),
  candy: swatch(tone(11)),
  kowloon: null,
  regmark: swatch(tone(12)),
  e1027: swatch(tone(13)),
  cyano: swatch(tone(14)),
  soleil: swatch(tone(15)),
  pinboard: swatch(tone(16)),
  grain: swatch(tone(17)),
  menu: swatch(tone(18)),
}
