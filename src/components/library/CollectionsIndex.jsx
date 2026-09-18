import { Plus, Search } from "lucide-react"
import { useState } from "react"
import { createCollection } from "../../data/repository.js"
import { formatDate, pluralize } from "../../lib/format.js"

/**
 * @param {object} props
 * @param {import("../../domain/types.js").Workspace} props.workspace
 * @param {ReturnType<import("../../data/repository.js").summarizeCollections>} props.summaries
 * @param {string} props.query
 * @param {(query: string) => void} props.onQuery
 * @param {(workspace: import("../../domain/types.js").Workspace) => void} props.onChange
 * @param {(collectionId: string) => void} props.onOpen
 * @param {() => void} props.onBrowseAll
 */
export function CollectionsIndex({ workspace, summaries, query, onQuery, onChange, onOpen, onBrowseAll }) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState("")
  const [error, setError] = useState(/** @type {string | null} */ (null))

  /**
   * @param {import("react").FormEvent} event
   */
  function handleCreate(event) {
    event.preventDefault()
    try {
      onChange(createCollection({ name }))
      setName("")
      setCreating(false)
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create the collection.")
    }
  }

  return (
    <section className="library-index" aria-label="Collections">
      <header className="library-index-head">
        <div>
          <p className="library-kicker">Library</p>
          <h2>Collections</h2>
          <p className="library-state-sub">Buckets for filing. Open one to operate it.</p>
        </div>
        <div className="library-index-tools">
          <label className="library-search">
            <Search size={14} strokeWidth={1.75} aria-hidden="true" />
            <input
              type="search"
              value={query}
              placeholder="Search across collections"
              onChange={(event) => onQuery(event.target.value)}
            />
          </label>
          {creating ? (
            <form className="library-create" onSubmit={handleCreate}>
              <input
                value={name}
                placeholder="Collection name"
                autoFocus
                onChange={(event) => setName(event.target.value)}
              />
              <button type="submit" className="library-btn">Create</button>
              <button
                type="button"
                className="library-btn"
                onClick={() => {
                  setCreating(false)
                  setError(null)
                }}
              >
                Cancel
              </button>
            </form>
          ) : (
            <button type="button" className="library-btn" onClick={() => setCreating(true)}>
              <Plus size={14} strokeWidth={1.75} />
              Create
            </button>
          )}
        </div>
      </header>

      {error ? <p className="library-index-error" role="alert">{error}</p> : null}

      <p className="library-index-meta">
        {pluralize(summaries.length, "collection")}
        <button type="button" className="library-text-btn" onClick={onBrowseAll}>
          Browse all {workspace.references.length} references
        </button>
      </p>

      {summaries.length === 0 ? (
        <div className="library-state" role="status">
          <p>No collections match{query ? ` “${query}”` : ""}.</p>
          <p className="library-state-sub">Search looks at collection names and the references filed in them.</p>
        </div>
      ) : (
        <ul className="library-stacks">
          {summaries.map((summary) => (
            <li key={summary.collection.id}>
              <button type="button" className="library-stack" onClick={() => onOpen(summary.collection.id)}>
                <span className="library-stack-previews" aria-hidden="true">
                  {summary.previews.length === 0 ? <span className="library-stack-empty" /> : null}
                  {summary.previews.map((preview, index) => (
                    <img
                      key={`${summary.collection.id}-${index}`}
                      src={preview}
                      alt=""
                      className={`is-layer-${Math.min(index, 2)}`}
                    />
                  ))}
                </span>
                <span className="library-stack-name">{summary.collection.name}</span>
                <span className="library-stack-meta">
                  {pluralize(summary.count, "reference")}
                  {summary.updatedAt ? ` · Updated ${formatDate(summary.updatedAt)}` : " · Empty"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
