import { statusLabel } from "../../domain/types.js"
import { formatDate } from "../../lib/format.js"

/**
 * @param {object} props
 * @param {import("../../domain/types.js").Reference[]} props.references
 * @param {import("../../domain/types.js").Workspace} props.workspace
 * @param {"grid" | "list"} props.view
 * @param {string[]} props.selectedIds
 * @param {(event: import("react").MouseEvent, id: string, index: number) => void} props.onSelect
 * @param {() => void} props.onClear
 * @param {boolean} props.emptyCollection
 * @param {boolean} props.noResults
 * @param {string} props.query
 */
export function LibraryBrowser({
  references,
  workspace,
  view,
  selectedIds,
  onSelect,
  onClear,
  emptyCollection,
  noResults,
  query,
}) {
  const selected = new Set(selectedIds)
  const collectionsById = Object.fromEntries(workspace.collections.map((collection) => [collection.id, collection]))
  const tagsById = Object.fromEntries(workspace.tags.map((tag) => [tag.id, tag]))
  const assetsByRef = groupAssets(workspace.assets)

  if (emptyCollection) {
    return (
      <div className="library-state" role="status">
        <p>No references in this collection.</p>
        <p className="library-state-sub">Inbox is empty. Captures land here before they are filed.</p>
      </div>
    )
  }

  if (noResults) {
    return (
      <div className="library-state" role="status">
        <p>No references match{query ? ` “${query}”` : " these filters"}.</p>
        <p className="library-state-sub">Search looks at titles, tags, notes, filenames, and collections.</p>
      </div>
    )
  }

  if (view === "list") {
    return (
      <div className="library-list-wrap" onClick={onClear}>
        <table className="library-list">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Collections</th>
              <th>Tags</th>
              <th>Captured</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {references.map((reference, index) => {
              const primary = primaryAsset(assetsByRef[reference.id])
              return (
                <tr
                  key={reference.id}
                  className={selected.has(reference.id) ? "is-selected" : undefined}
                  onClick={(event) => {
                    event.stopPropagation()
                    onSelect(event, reference.id, index)
                  }}
                >
                  <td>
                    <span className="library-list-ref">
                      <Thumb asset={primary} status={reference.status} />
                      <span>{reference.title}</span>
                    </span>
                  </td>
                  <td>{reference.collectionIds.map((id) => collectionsById[id]?.name).filter(Boolean).join(", ") || "—"}</td>
                  <td>{reference.tagIds.map((id) => tagsById[id]?.name).filter(Boolean).join(", ") || "—"}</td>
                  <td>{formatDate(reference.createdAt)}</td>
                  <td>
                    <StatusChip status={reference.status} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="library-grid" onClick={onClear}>
      {references.map((reference, index) => {
        const primary = primaryAsset(assetsByRef[reference.id])
        return (
          <article
            key={reference.id}
            className={`library-card${selected.has(reference.id) ? " is-selected" : ""}`}
            onClick={(event) => {
              event.stopPropagation()
              onSelect(event, reference.id, index)
            }}
          >
            <div className="library-card-thumb">
              <Thumb asset={primary} status={reference.status} />
              {reference.status !== "ready" ? (
                <span className="library-card-badge">{statusLabel(reference.status)}</span>
              ) : null}
            </div>
            <div className="library-card-meta">
              <h3>{reference.title}</h3>
              <p>
                {reference.tagIds.slice(0, 2).map((id) => tagsById[id]?.name).filter(Boolean).join(" · ")
                  || collectionsById[reference.collectionIds[0]]?.name
                  || "Unfiled"}
              </p>
            </div>
          </article>
        )
      })}
    </div>
  )
}

/**
 * @param {import("../../domain/types.js").Asset | undefined} asset
 * @param {import("../../domain/types.js").ObjectStatus} status
 */
function Thumb({ asset, status }) {
  if (status === "processing" || asset?.status === "processing" || !asset?.preview) {
    return <div className="library-thumb is-processing" aria-hidden="true" />
  }
  return <img src={asset.preview} alt="" draggable={false} />
}

/**
 * @param {import("../../domain/types.js").ObjectStatus} status
 */
function StatusChip({ status }) {
  return <span className={`library-status is-${status}`}>{statusLabel(status)}</span>
}

/**
 * @param {import("../../domain/types.js").Asset[] | undefined} assets
 */
function primaryAsset(assets) {
  if (!assets?.length) return undefined
  return assets.find((asset) => asset.role === "original") ?? assets[0]
}

/**
 * @param {import("../../domain/types.js").Asset[]} assets
 */
function groupAssets(assets) {
  /** @type {Record<string, import("../../domain/types.js").Asset[]>} */
  const grouped = {}
  for (const asset of assets) {
    if (!grouped[asset.referenceId]) grouped[asset.referenceId] = []
    grouped[asset.referenceId].push(asset)
  }
  return grouped
}
