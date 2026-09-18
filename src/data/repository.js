/**
 * Persistence boundary for Kept.
 *
 * Today this reads in-memory fixtures. Swap the internals for local JSON
 * or hosted storage without touching UI callers.
 *
 * Do not import `fixtures.js` from outside `src/data/`.
 */

import { createFixtureWorkspace } from "./fixtures.js"

const LOAD_MS = 420

/** @type {import("../domain/types.js").Workspace | null} */
let workspace = null

if (import.meta.hot) {
  import.meta.hot.accept("./fixtures.js", () => {
    workspace = createFixtureWorkspace()
  })
}

/** @type {Set<(workspace: import("../domain/types.js").Workspace) => void>} */
const listeners = new Set()

/**
 * @param {number} ms
 */
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * @returns {import("../domain/types.js").Workspace}
 */
function snapshot() {
  if (!workspace) {
    throw new Error("Workspace is not open.")
  }
  return structuredClone(workspace)
}

function emit() {
  const next = snapshot()
  for (const listener of listeners) listener(next)
  return next
}

/**
 * @param {(workspace: import("../domain/types.js").Workspace) => void} listener
 * @returns {() => void}
 */
export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Open the library. Simulates a short load so the operate UI can show
 * a real loading state. Safe to call again (returns the live workspace).
 *
 * @returns {Promise<import("../domain/types.js").Workspace>}
 */
export async function openWorkspace() {
  await wait(LOAD_MS)
  if (!workspace) {
    workspace = createFixtureWorkspace()
  }
  return snapshot()
}

/**
 * Synchronous read after `openWorkspace()`.
 * @returns {import("../domain/types.js").Workspace}
 */
export function getWorkspace() {
  return snapshot()
}

/**
 * Reset to fixture seed. Useful for development; not used by the UI yet.
 * @returns {import("../domain/types.js").Workspace}
 */
export function resetWorkspace() {
  workspace = createFixtureWorkspace()
  return emit()
}

/**
 * @param {object} input
 * @param {string} input.name
 * @param {string} [input.description]
 * @returns {import("../domain/types.js").Workspace}
 */
export function createCollection({ name, description = "" }) {
  if (!workspace) throw new Error("Workspace is not open.")
  const trimmed = name.trim()
  if (!trimmed) throw new Error("Collection name is required.")
  const id = `col_${crypto.randomUUID().slice(0, 8)}`
  workspace.collections = [
    ...workspace.collections,
    {
      id,
      name: trimmed,
      description: description.trim(),
      ownerId: workspace.user.id,
    },
  ]
  return emit()
}

/**
 * @param {string[]} referenceIds
 * @param {string} collectionId
 * @returns {import("../domain/types.js").Workspace}
 */
export function addToCollection(referenceIds, collectionId) {
  if (!workspace) throw new Error("Workspace is not open.")
  const collection = workspace.collections.find((item) => item.id === collectionId)
  if (!collection) throw new Error(`Unknown collection: ${collectionId}`)

  const idSet = new Set(referenceIds)
  const now = new Date().toISOString()
  workspace.references = workspace.references.map((reference) => {
    if (!idSet.has(reference.id)) return reference
    if (reference.collectionIds.includes(collectionId)) return reference
    return {
      ...reference,
      collectionIds: [...reference.collectionIds, collectionId],
      updatedAt: now,
    }
  })
  return emit()
}

/**
 * @param {string[]} referenceIds
 * @param {string} collectionId
 * @returns {import("../domain/types.js").Workspace}
 */
export function removeFromCollection(referenceIds, collectionId) {
  if (!workspace) throw new Error("Workspace is not open.")
  const idSet = new Set(referenceIds)
  const now = new Date().toISOString()
  workspace.references = workspace.references.map((reference) => {
    if (!idSet.has(reference.id)) return reference
    return {
      ...reference,
      collectionIds: reference.collectionIds.filter((id) => id !== collectionId),
      updatedAt: now,
    }
  })
  return emit()
}

/**
 * @param {string[]} referenceIds
 * @param {string} tagId
 * @returns {import("../domain/types.js").Workspace}
 */
export function applyTag(referenceIds, tagId) {
  if (!workspace) throw new Error("Workspace is not open.")
  const tag = workspace.tags.find((item) => item.id === tagId)
  if (!tag) throw new Error(`Unknown tag: ${tagId}`)

  const idSet = new Set(referenceIds)
  const now = new Date().toISOString()
  workspace.references = workspace.references.map((reference) => {
    if (!idSet.has(reference.id)) return reference
    if (reference.tagIds.includes(tagId)) return reference
    return {
      ...reference,
      tagIds: [...reference.tagIds, tagId],
      updatedAt: now,
    }
  })
  return emit()
}

/**
 * @param {string[]} referenceIds
 * @param {string} tagId
 * @returns {import("../domain/types.js").Workspace}
 */
export function removeTag(referenceIds, tagId) {
  if (!workspace) throw new Error("Workspace is not open.")
  const idSet = new Set(referenceIds)
  const now = new Date().toISOString()
  workspace.references = workspace.references.map((reference) => {
    if (!idSet.has(reference.id)) return reference
    return {
      ...reference,
      tagIds: reference.tagIds.filter((id) => id !== tagId),
      updatedAt: now,
    }
  })
  return emit()
}

/**
 * Query helpers used by the library UI. Filtering stays in the repository
 * so a later JSON/hosted backend can take it over.
 *
 * @param {import("../domain/types.js").Workspace} current
 * @param {object} filters
 * @param {string} [filters.query]
 * @param {string | null} [filters.collectionId]
 * @param {string | null} [filters.tagId]
 * @param {"all" | import("../domain/types.js").ObjectStatus} [filters.status]
 * @returns {import("../domain/types.js").Reference[]}
 */
export function queryReferences(current, filters = {}) {
  const needle = (filters.query ?? "").trim().toLowerCase()
  const notesByRef = groupBy(current.notes, (note) => note.referenceId)
  const assetsByRef = groupBy(current.assets, (asset) => asset.referenceId)
  const tagsById = Object.fromEntries(current.tags.map((tag) => [tag.id, tag]))
  const collectionsById = Object.fromEntries(current.collections.map((collection) => [collection.id, collection]))

  return current.references.filter((reference) => {
    if (filters.collectionId && !reference.collectionIds.includes(filters.collectionId)) return false
    if (filters.tagId && !reference.tagIds.includes(filters.tagId)) return false
    if (filters.status && filters.status !== "all" && reference.status !== filters.status) return false
    if (!needle) return true

    const haystacks = [
      reference.title,
      reference.sourceUrl ?? "",
      reference.capturedVia,
      reference.status,
      ...reference.tagIds.map((id) => tagsById[id]?.name ?? ""),
      ...reference.collectionIds.map((id) => collectionsById[id]?.name ?? ""),
      ...(notesByRef[reference.id] ?? []).map((note) => note.body),
      ...(assetsByRef[reference.id] ?? []).map((asset) => asset.filename),
    ]
    return haystacks.some((value) => value.toLowerCase().includes(needle))
  })
}

/**
 * @template T
 * @param {T[]} items
 * @param {(item: T) => string} keyOf
 * @returns {Record<string, T[]>}
 */
function groupBy(items, keyOf) {
  /** @type {Record<string, T[]>} */
  const grouped = {}
  for (const item of items) {
    const key = keyOf(item)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(item)
  }
  return grouped
}

/**
 * Collections-home summaries. Search looks at collection name/description
 * and across member titles, tags, notes, and filenames.
 *
 * @param {import("../domain/types.js").Workspace} current
 * @param {string} [query]
 * @returns {Array<{
 *   collection: import("../domain/types.js").Collection,
 *   count: number,
 *   updatedAt: string | null,
 *   previews: string[],
 * }>}
 */
export function summarizeCollections(current, query = "") {
  const needle = query.trim().toLowerCase()
  const notesByRef = groupBy(current.notes, (note) => note.referenceId)
  const assetsByRef = groupBy(current.assets, (asset) => asset.referenceId)
  const tagsById = Object.fromEntries(current.tags.map((tag) => [tag.id, tag]))

  return current.collections
    .map((collection) => {
      const members = current.references
        .filter((reference) => reference.collectionIds.includes(collection.id))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      const previews = []
      for (const reference of members) {
        if (previews.length >= 3) break
        const asset = (assetsByRef[reference.id] ?? []).find((item) => item.preview)
        if (asset?.preview) previews.push(asset.preview)
      }
      return {
        collection,
        count: members.length,
        updatedAt: members[0]?.updatedAt ?? null,
        previews,
        haystack: [
          collection.name,
          collection.description,
          ...members.flatMap((reference) => [
            reference.title,
            ...(notesByRef[reference.id] ?? []).map((note) => note.body),
            ...(assetsByRef[reference.id] ?? []).map((asset) => asset.filename),
            ...reference.tagIds.map((id) => tagsById[id]?.name ?? ""),
          ]),
        ].join(" ").toLowerCase(),
      }
    })
    .filter((summary) => !needle || summary.haystack.includes(needle))
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))
    .map(({ haystack, ...summary }) => {
      void haystack
      return summary
    })
}
