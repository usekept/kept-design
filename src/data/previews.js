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

export const previews = {
  bazaar: swatch("#C45C3E"),
  grotesk: swatch("#1C1C1C"),
  ando: swatch("#C4B8A8"),
  cadmium: swatch("#E23B14"),
  braun: swatch("#C8C2B6"),
  braunDetail: swatch("#A8A296"),
  braunBack: swatch("#8A8478"),
  stalker: swatch("#1C2418"),
  binding: swatch("#D9C9A8"),
  subway: swatch("#1569FF"),
  perriand: swatch("#C5D9C8"),
  candy: swatch("#FA586A"),
  kowloon: null,
  regmark: swatch("#111111"),
  e1027: swatch("#C5D7E3"),
  cyano: swatch("#0B3A6E"),
  soleil: swatch("#0E0E0E"),
  pinboard: swatch("#CBB48A"),
  grain: swatch("#E8D5B0"),
  menu: swatch("#EDE4D0"),
}
