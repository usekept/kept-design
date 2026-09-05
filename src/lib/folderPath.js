/**
 * Folder geometry, transcribed from KEPT-DESIGN 1010.svg (Figma export, 1440x1024 frame).
 * Every folder in the comp shares these constants — only width, height and tab width vary.
 */
export const R = 19.32 // corner radius
export const TAB_H = 48.29 // tab step height
const S_RUN = 40.56 // horizontal run of the S-curve from tab edge into the body
const S_CP = 30.01 // control-point offset that gives the S its tight fillet
const K = 0.4477 // circular-arc bezier constant

/**
 * Outline of one folder in local coordinates, origin at the tab's top-left.
 * `h` is measured from the tab top, so it includes TAB_H.
 */
export function folderPath(w, h, tabW) {
  const c = R * K
  return [
    `M0 ${R}`,
    `C0 ${c} ${c} 0 ${R} 0`,
    `H${tabW}`,
    `C${tabW + S_CP} 0 ${tabW + S_RUN - S_CP} ${TAB_H} ${tabW + S_RUN} ${TAB_H}`,
    `H${w - R}`,
    `C${w - c} ${TAB_H} ${w} ${TAB_H + c} ${w} ${TAB_H + R}`,
    `V${h - R}`,
    `C${w} ${h - c} ${w - c} ${h} ${w - R} ${h}`,
    `H${R}`,
    `C${c} ${h} 0 ${h - c} 0 ${h - R}`,
    "Z",
  ].join(" ")
}
