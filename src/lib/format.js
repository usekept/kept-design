/**
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * @param {string | null | undefined} iso
 * @returns {string}
 */
export function formatDate(iso) {
  if (!iso) return "—"
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/**
 * @param {number | null | undefined} width
 * @param {number | null | undefined} height
 * @returns {string}
 */
export function formatDimensions(width, height) {
  if (!width || !height) return "—"
  return `${width} × ${height}`
}

/**
 * @param {number} count
 * @param {string} word
 * @returns {string}
 */
export function pluralize(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`
}
