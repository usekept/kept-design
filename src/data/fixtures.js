/**
 * Believable personal visual-reference library.
 * Callers must go through `src/data/repository.js` — do not import this file
 * from UI code.
 */

import { previews } from "./previews.js"

const USER = {
  id: "usr_onwend",
  name: "Wade",
  handle: "onwend",
}

const collections = [
  { id: "col_inbox", name: "Inbox", description: "Unfiled captures. Empty on purpose.", ownerId: USER.id },
  { id: "col_editorial", name: "Editorial", description: "Covers, spreads, printed matter.", ownerId: USER.id },
  { id: "col_type", name: "Type", description: "Specimens and lettering.", ownerId: USER.id },
  { id: "col_interiors", name: "Interiors", description: "Rooms, furniture, light.", ownerId: USER.id },
  { id: "col_color", name: "Color", description: "Palettes and material studies.", ownerId: USER.id },
  { id: "col_product", name: "Product", description: "Objects worth stealing from.", ownerId: USER.id },
  { id: "col_film", name: "Film", description: "Stills and title cards.", ownerId: USER.id },
  { id: "col_process", name: "Process", description: "Dummies, marks, the studio.", ownerId: USER.id },
]

const tags = [
  { id: "tag_print", name: "print" },
  { id: "tag_35mm", name: "35mm" },
  { id: "tag_concrete", name: "concrete" },
  { id: "tag_serif", name: "serif" },
  { id: "tag_night", name: "night" },
  { id: "tag_packaging", name: "packaging" },
  { id: "tag_diagram", name: "diagram" },
  { id: "tag_archival", name: "archival" },
  { id: "tag_sketch", name: "sketch" },
  { id: "tag_modernist", name: "modernist" },
]

/**
 * @param {string} id
 * @param {string} title
 * @param {object} rest
 */
function reference(id, title, rest) {
  return {
    id,
    title,
    ownerId: USER.id,
    keywords: [],
    description: "",
    ocrText: "",
    embedding: null,
    sourceUrl: null,
    ...rest,
  }
}

const references = [
  reference("ref_bazaar", "April cover study", {
    createdAt: "2026-03-12T14:10:00.000Z",
    updatedAt: "2026-03-14T09:22:00.000Z",
    capturedVia: "upload",
    status: "ready",
    collectionIds: ["col_editorial"],
    tagIds: ["tag_print", "tag_serif"],
  }),
  reference("ref_grotesk", "Haas Grotesk specimen sheet", {
    createdAt: "2026-02-02T11:00:00.000Z",
    updatedAt: "2026-02-02T11:04:00.000Z",
    capturedVia: "url",
    sourceUrl: "https://example.com/haas-grotesk",
    status: "ready",
    collectionIds: ["col_type"],
    tagIds: ["tag_print"],
  }),
  reference("ref_ando", "Church of Light, Ibaraki", {
    createdAt: "2025-11-18T08:40:00.000Z",
    updatedAt: "2026-01-09T16:12:00.000Z",
    capturedVia: "url",
    sourceUrl: "https://example.com/ando-ibaraki",
    status: "ready",
    collectionIds: ["col_interiors"],
    tagIds: ["tag_concrete"],
  }),
  reference("ref_cadmium", "Cadmium / bone palette", {
    createdAt: "2026-04-01T19:05:00.000Z",
    updatedAt: "2026-04-01T19:05:00.000Z",
    capturedVia: "paste",
    status: "ready",
    collectionIds: ["col_color"],
    tagIds: ["tag_print"],
  }),
  reference("ref_braun", "Braun SK 4", {
    createdAt: "2025-12-04T10:18:00.000Z",
    updatedAt: "2026-06-11T13:40:00.000Z",
    capturedVia: "url",
    sourceUrl: "https://example.com/braun-sk4",
    status: "ready",
    collectionIds: ["col_product"],
    tagIds: ["tag_modernist"],
  }),
  reference("ref_stalker", "Stalker, Zone corridor", {
    createdAt: "2026-01-22T21:11:00.000Z",
    updatedAt: "2026-01-23T08:02:00.000Z",
    capturedVia: "url",
    sourceUrl: "https://example.com/stalker-still",
    status: "ready",
    collectionIds: ["col_film"],
    tagIds: ["tag_35mm"],
  }),
  reference("ref_binding", "Sewn signatures dummy", {
    createdAt: "2026-05-09T15:33:00.000Z",
    updatedAt: "2026-05-09T15:33:00.000Z",
    capturedVia: "upload",
    status: "ready",
    collectionIds: ["col_process"],
    tagIds: ["tag_print", "tag_archival"],
  }),
  reference("ref_subway", "NYCTA map fragment", {
    createdAt: "2026-03-28T12:00:00.000Z",
    updatedAt: "2026-03-28T12:44:00.000Z",
    capturedVia: "paste",
    status: "ready",
    collectionIds: ["col_editorial"],
    tagIds: ["tag_diagram"],
  }),
  reference("ref_perriand", "Free-form table, Perriand", {
    createdAt: "2025-10-07T09:50:00.000Z",
    updatedAt: "2025-10-08T11:20:00.000Z",
    capturedVia: "url",
    sourceUrl: "https://example.com/perriand-table",
    status: "ready",
    collectionIds: ["col_interiors"],
    tagIds: ["tag_modernist"],
  }),
  reference("ref_candy", "Tokyo station candy wrap", {
    createdAt: "2026-07-19T04:12:00.000Z",
    updatedAt: "2026-07-19T04:18:00.000Z",
    capturedVia: "upload",
    status: "ready",
    collectionIds: ["col_product"],
    tagIds: ["tag_packaging", "tag_print"],
  }),
  reference("ref_kowloon", "Night street, Kowloon", {
    createdAt: "2026-09-18T08:02:00.000Z",
    updatedAt: "2026-09-18T08:02:00.000Z",
    capturedVia: "upload",
    status: "processing",
    collectionIds: ["col_film"],
    tagIds: ["tag_night", "tag_35mm"],
  }),
  reference("ref_regmark", "Offset registration marks", {
    createdAt: "2026-06-02T17:26:00.000Z",
    updatedAt: "2026-06-02T17:26:00.000Z",
    capturedVia: "paste",
    status: "ready",
    collectionIds: ["col_process"],
    tagIds: ["tag_print", "tag_diagram"],
  }),
  reference("ref_e1027", "E-1027, Roquebrune", {
    createdAt: "2025-09-30T13:08:00.000Z",
    updatedAt: "2026-02-14T10:00:00.000Z",
    capturedVia: "url",
    sourceUrl: "https://example.com/e1027",
    status: "ready",
    collectionIds: ["col_interiors"],
    tagIds: ["tag_modernist"],
  }),
  reference("ref_cyano", "Cyanotype, fern", {
    createdAt: "2026-04-22T16:45:00.000Z",
    updatedAt: "2026-04-22T16:45:00.000Z",
    capturedVia: "upload",
    status: "ready",
    collectionIds: ["col_color"],
    tagIds: ["tag_archival"],
  }),
  reference("ref_soleil", "Sans Soleil title card", {
    createdAt: "2026-01-05T22:30:00.000Z",
    updatedAt: "2026-01-06T09:10:00.000Z",
    capturedVia: "url",
    sourceUrl: "https://example.com/sans-soleil",
    status: "ready",
    collectionIds: ["col_film"],
    tagIds: ["tag_35mm"],
  }),
  reference("ref_pinboard", "Studio pinboard, Friday", {
    createdAt: "2026-08-15T18:20:00.000Z",
    updatedAt: "2026-08-15T18:20:00.000Z",
    capturedVia: "paste",
    status: "ready",
    collectionIds: ["col_process"],
    tagIds: ["tag_sketch"],
  }),
  reference("ref_grain", "Somerset paper grain", {
    createdAt: "2026-05-28T11:14:00.000Z",
    updatedAt: "2026-05-28T11:14:00.000Z",
    capturedVia: "upload",
    status: "ready",
    collectionIds: ["col_process"],
    tagIds: ["tag_print", "tag_archival"],
  }),
  reference("ref_menu", "Cervejaria menu, Lisbon", {
    createdAt: "2026-06-21T20:05:00.000Z",
    updatedAt: "2026-06-22T08:40:00.000Z",
    capturedVia: "upload",
    status: "ready",
    collectionIds: ["col_editorial"],
    tagIds: ["tag_print", "tag_serif"],
  }),
]

/**
 * @param {string} id
 * @param {string} referenceId
 * @param {string} filename
 * @param {object} rest
 */
function asset(id, referenceId, filename, rest) {
  return {
    id,
    referenceId,
    filename,
    mimeType: "image/jpeg",
    role: "original",
    status: "ready",
    width: 2400,
    height: 3000,
    byteSize: 1_840_000,
    preview: null,
    ...rest,
  }
}

const assets = [
  asset("ast_bazaar", "ref_bazaar", "april-cover-study.jpg", { preview: previews.bazaar, byteSize: 2_210_441 }),
  asset("ast_grotesk", "ref_grotesk", "haas-grotesk-specimen.jpg", { preview: previews.grotesk, mimeType: "image/png", byteSize: 980_120, width: 2100, height: 2625 }),
  asset("ast_ando", "ref_ando", "church-of-light.jpg", { preview: previews.ando, byteSize: 3_402_110, width: 3000, height: 3750 }),
  asset("ast_cadmium", "ref_cadmium", "cadmium-bone.png", { preview: previews.cadmium, mimeType: "image/png", byteSize: 420_008, width: 1600, height: 2000 }),
  asset("ast_braun", "ref_braun", "braun-sk4-front.jpg", { preview: previews.braun, byteSize: 1_662_900 }),
  asset("ast_braun_detail", "ref_braun", "braun-sk4-platter.jpg", { preview: previews.braunDetail, role: "derivative", byteSize: 744_200, width: 1800, height: 1800 }),
  asset("ast_braun_back", "ref_braun", "braun-sk4-verso.jpg", { preview: previews.braunBack, role: "derivative", byteSize: 801_330 }),
  asset("ast_stalker", "ref_stalker", "stalker-corridor.jpg", { preview: previews.stalker, byteSize: 2_880_000, width: 1920, height: 1080 }),
  asset("ast_binding", "ref_binding", "sewn-dummy.jpg", { preview: previews.binding, byteSize: 1_104_550 }),
  asset("ast_subway", "ref_subway", "nycta-fragment.png", { preview: previews.subway, mimeType: "image/png", byteSize: 612_440, width: 2200, height: 2750 }),
  asset("ast_perriand", "ref_perriand", "perriand-table.jpg", { preview: previews.perriand, byteSize: 1_990_210 }),
  asset("ast_candy", "ref_candy", "ueno-candy-wrap.jpg", { preview: previews.candy, byteSize: 1_245_900 }),
  asset("ast_kowloon", "ref_kowloon", "kowloon-night.dng", {
    preview: null,
    mimeType: "image/x-adobe-dng",
    status: "processing",
    byteSize: 28_441_092,
    width: null,
    height: null,
  }),
  asset("ast_regmark", "ref_regmark", "registration-marks.tif", { preview: previews.regmark, mimeType: "image/tiff", byteSize: 4_120_000, width: 2550, height: 3300 }),
  asset("ast_e1027", "ref_e1027", "e1027-facade.jpg", { preview: previews.e1027, byteSize: 2_540_880 }),
  asset("ast_cyano", "ref_cyano", "cyanotype-fern.jpg", { preview: previews.cyano, byteSize: 1_330_400 }),
  asset("ast_soleil", "ref_soleil", "sans-soleil-title.jpg", { preview: previews.soleil, byteSize: 640_220, width: 1920, height: 1080 }),
  asset("ast_pinboard", "ref_pinboard", "studio-pinboard.jpg", { preview: previews.pinboard, byteSize: 3_110_000 }),
  asset("ast_grain", "ref_grain", "somerset-grain.jpg", { preview: previews.grain, byteSize: 5_002_100, width: 4000, height: 5000 }),
  asset("ast_menu", "ref_menu", "cervejaria-menu.jpg", { preview: previews.menu, byteSize: 1_870_660 }),
]

const notes = [
  {
    id: "note_bazaar",
    referenceId: "ref_bazaar",
    body: "Steal the italic masthead, not the circle. Type is sitting too high on the real cover — this study overcorrects.",
    createdAt: "2026-03-14T09:22:00.000Z",
  },
  {
    id: "note_ando",
    referenceId: "ref_ando",
    body: "Cross of light is a cut, not a window. The concrete reads warmer in late afternoon than this capture.",
    createdAt: "2026-01-09T16:12:00.000Z",
  },
  {
    id: "note_braun",
    referenceId: "ref_braun",
    body: "Three assets: front, platter, verso. The lid is the product. Keep the SK 4 next to E-1027 — same discipline, different material.",
    createdAt: "2026-06-11T13:40:00.000Z",
  },
  {
    id: "note_menu",
    referenceId: "ref_menu",
    body: "Rules, not decoration. The restaurant does not have a website. This is the whole identity.",
    createdAt: "2026-06-22T08:40:00.000Z",
  },
]

const relationships = [
  { id: "rel_braun_e1027", sourceId: "ref_braun", targetId: "ref_e1027", type: "influence", note: "Same refusal of ornament." },
  { id: "rel_stalker_kowloon", sourceId: "ref_stalker", targetId: "ref_kowloon", type: "similar", note: "Green-black night, corridor as landscape." },
  { id: "rel_bazaar_grotesk", sourceId: "ref_bazaar", targetId: "ref_grotesk", type: "source", note: "Cover study pulled the grotesk cut from this sheet." },
]

/**
 * @returns {import("../domain/types.js").Workspace}
 */
export function createFixtureWorkspace() {
  return structuredClone({
    user: USER,
    collections,
    tags,
    references,
    assets,
    notes,
    relationships,
  })
}
