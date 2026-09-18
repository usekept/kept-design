/**
 * Domain types for Kept.
 *
 * The core unit is a Reference, not a File. An Asset is a stored file
 * attached to a Reference (1..n). Organize = collections + tags.
 * Connect = typed, directional relationships.
 *
 * Index-later fields live on Reference (keywords, description, ocrText,
 * embedding) and stay empty until an enrichment pipeline exists.
 *
 * @module domain/types
 */

/**
 * @typedef {"ready" | "processing" | "failed"} ObjectStatus
 */

/**
 * @typedef {"upload" | "url" | "paste"} CaptureMethod
 */

/**
 * @typedef {"original" | "derivative" | "thumbnail"} AssetRole
 */

/**
 * @typedef {"influence" | "similar" | "contrast" | "source" | "association"} RelationshipType
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} handle
 */

/**
 * @typedef {Object} Collection
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} ownerId
 */

/**
 * @typedef {Object} Tag
 * @property {string} id
 * @property {string} name
 */

/**
 * @typedef {Object} Asset
 * @property {string} id
 * @property {string} referenceId
 * @property {string} filename
 * @property {string} mimeType
 * @property {number} byteSize
 * @property {number | null} width
 * @property {number | null} height
 * @property {AssetRole} role
 * @property {ObjectStatus} status
 * @property {string | null} preview
 */

/**
 * @typedef {Object} Note
 * @property {string} id
 * @property {string} referenceId
 * @property {string} body
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Relationship
 * @property {string} id
 * @property {string} sourceId
 * @property {string} targetId
 * @property {RelationshipType} type
 * @property {string} [note]
 */

/**
 * @typedef {Object} Reference
 * @property {string} id
 * @property {string} title
 * @property {string} ownerId
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {CaptureMethod} capturedVia
 * @property {string | null} sourceUrl
 * @property {ObjectStatus} status
 * @property {string[]} collectionIds
 * @property {string[]} tagIds
 * @property {string[]} keywords
 * @property {string} description
 * @property {string} ocrText
 * @property {null} embedding
 */

/**
 * @typedef {Object} Workspace
 * @property {User} user
 * @property {Collection[]} collections
 * @property {Tag[]} tags
 * @property {Reference[]} references
 * @property {Asset[]} assets
 * @property {Note[]} notes
 * @property {Relationship[]} relationships
 */

export const OBJECT_STATUSES = /** @type {const} */ (["ready", "processing", "failed"])
export const CAPTURE_METHODS = /** @type {const} */ (["upload", "url", "paste"])
export const ASSET_ROLES = /** @type {const} */ (["original", "derivative", "thumbnail"])
export const RELATIONSHIP_TYPES = /** @type {const} */ ([
  "influence",
  "similar",
  "contrast",
  "source",
  "association",
])

/**
 * @param {RelationshipType} type
 * @returns {string}
 */
export function relationshipLabel(type) {
  switch (type) {
    case "influence":
      return "Influence"
    case "similar":
      return "Similar"
    case "contrast":
      return "Contrast"
    case "source":
      return "Source"
    case "association":
      return "Association"
    default: {
      const _exhaustive = /** @type {never} */ (type)
      return _exhaustive
    }
  }
}

/**
 * @param {ObjectStatus} status
 * @returns {string}
 */
export function statusLabel(status) {
  switch (status) {
    case "ready":
      return "Ready"
    case "processing":
      return "Processing"
    case "failed":
      return "Failed"
    default: {
      const _exhaustive = /** @type {never} */ (status)
      return _exhaustive
    }
  }
}

/**
 * @param {CaptureMethod} method
 * @returns {string}
 */
export function captureLabel(method) {
  switch (method) {
    case "upload":
      return "Upload"
    case "url":
      return "URL"
    case "paste":
      return "Paste"
    default: {
      const _exhaustive = /** @type {never} */ (method)
      return _exhaustive
    }
  }
}

/**
 * @param {AssetRole} role
 * @returns {string}
 */
export function assetRoleLabel(role) {
  switch (role) {
    case "original":
      return "Original"
    case "derivative":
      return "Derivative"
    case "thumbnail":
      return "Thumbnail"
    default: {
      const _exhaustive = /** @type {never} */ (role)
      return _exhaustive
    }
  }
}
