/**
 * The landing composition, in the design's own 1440x1024 coordinate space
 * (KEPT-DESIGN 1010.svg). Everything is positioned in these units and the stage
 * is scaled to the viewport, so the collage keeps its exact proportions.
 *
 * Coordinates are ink extents read off the Figma export: `x` is the left edge of
 * the first glyph, `y` the cap-height top of the first line. Text offsets are
 * relative to their folder's origin so a folder carries its copy when it moves.
 */
export const FRAME_W = 1440
export const FRAME_H = 1024

/** On wide viewports the lower folders run off the bottom edge, as drawn. */
export const BLEED_BOTTOM = 2400

/**
 * Below this width the comp is cropped rather than fitted — a uniform fit would
 * put the lede at around 9px. FOCUS frames the wordmark and the Personal
 * knowledge folder, centred on that folder; the wordmark is re-centred separately
 * because the comp centres it on the full 1440 frame rather than on the collage.
 */
export const NARROW_MAX_W = 860
export const FOCUS = { x: 188.6, y: 60, w: 708 }

/** Design-space width of the wordmark's ink, used to re-centre it when cropped. */
export const WORDMARK_W = 181

export const WORDMARK = { text: "kept.", x: 630.26, y: 132.27 }

/**
 * Both paragraphs are hard-broken in the design rather than wrapped — the
 * tagline's lone "Your" on line one can't fall out of any greedy wrap — so the
 * breaks are reproduced literally. `text` keeps the sentence intact for
 * assistive tech.
 */
export const LEDE = {
  text: "You capture a lot. We help you keep it. Kept is a private workspace for your research, references, and ideas — organized, searchable, and ready when you are.",
  lines: [
    "You capture a lot. We help you",
    "keep it. Kept is a private workspace",
    "for your research, references, and",
    "ideas — organized, searchable,",
    "and ready when you are.",
  ],
  dx: 27.547,
  dy: 210.575,
}

export const TAGLINE = {
  text: "Your reference manager for everything that matters.",
  lines: ["Your", "reference manager", "for everything", "that matters."],
  dx: 398.315,
  dy: 217.359,
  /** In the comp this sits in the Researchers folder; in the mobile pile that
   *  folder is buried, so the line rides the topmost folder instead. */
  owner: "researchers",
  mobile: { owner: "builders", dx: 385, dy: 96 },
}

/**
 * Listed in paint order — each folder's white fill covers the outlines behind it.
 * Label offsets are measured per folder rather than shared: the comp's tab labels
 * are hand-placed and sit up to 4 units apart relative to their tabs.
 */
export const FOLDERS = [
  {
    id: "personal",
    x: 222.133,
    y: 297.465,
    w: 641.29,
    h: 471.31,
    tabW: 294.57,
    label: { text: "Personal knowledge", dx: 28.967, dy: 31.845 },
  },
  {
    id: "researchers",
    x: 759.115,
    y: 651.911,
    w: 627.78,
    tabW: 295.54,
    bleed: true,
    label: { text: "Researchers", dx: 28.965, dy: 32.849 },
  },
  {
    id: "creatives",
    x: 399.84,
    y: 725.312,
    w: 629.7,
    tabW: 293.6,
    bleed: true,
    label: { text: "Creatives", dx: 27.03, dy: 29.008 },
  },
  {
    id: "agents",
    x: 56.982,
    y: 790.021,
    w: 653.84,
    tabW: 291.67,
    bleed: true,
    label: { text: "Agents", dx: 26.068, dy: 28.949 },
  },
  {
    id: "builders",
    x: 587.203,
    y: 862.455,
    w: 545.67,
    tabW: 282.98,
    bleed: true,
    label: { text: "Builders", dx: 27.967, dy: 30.915 },
  },
]

/**
 * Narrow viewports give every folder the hero folder's size and stagger them
 * into a pile, so the stack reads as a set of real folders rather than as panels
 * trailing off the bottom of the screen.
 */
const MOBILE_FOLDER = { x: 222, y: 297, w: 641.29, h: 471.31, tabW: 294.57 }

const STACK = {
  top: 790,
  minStep: 70,
  maxStep: 140,
  x: { researchers: 236, creatives: 205, agents: 250, builders: 220 },
  /** Tab, then enough body for the tagline the topmost folder carries. */
  lastFolderRoom: 275,
}

/** Folder geometry for the current mode. */
export function layoutFolders({ narrow, visibleBottom }) {
  if (!narrow) {
    return FOLDERS.map((f) => ({
      ...f,
      h: f.bleed ? BLEED_BOTTOM - f.y : f.h,
    }))
  }

  // Tighten the stagger until the topmost folder has room for its tagline.
  const room = visibleBottom - STACK.lastFolderRoom - STACK.top
  const step = Math.max(STACK.minStep, Math.min(STACK.maxStep, room / 3))

  let i = 0
  return FOLDERS.map((f) =>
    f.bleed
      ? { ...f, ...MOBILE_FOLDER, x: STACK.x[f.id], y: STACK.top + step * i++ }
      : { ...f, ...MOBILE_FOLDER },
  )
}
