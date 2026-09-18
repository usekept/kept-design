import { Folder, Hash, LayoutGrid } from "lucide-react"

/**
 * @param {object} props
 * @param {import("../../domain/types.js").Workspace} props.workspace
 * @param {string | null} props.collectionId
 * @param {string | null} props.tagId
 * @param {boolean} props.allReferences
 * @param {() => void} props.onHome
 * @param {(id: string | null) => void} props.onCollection
 * @param {(id: string | null) => void} props.onTag
 */
export function LibrarySidebar({ workspace, collectionId, tagId, allReferences, onHome, onCollection, onTag }) {
  const collectionCounts = Object.fromEntries(
    workspace.collections.map((collection) => [
      collection.id,
      workspace.references.filter((reference) => reference.collectionIds.includes(collection.id)).length,
    ]),
  )
  const tagCounts = Object.fromEntries(
    workspace.tags.map((tag) => [
      tag.id,
      workspace.references.filter((reference) => reference.tagIds.includes(tag.id)).length,
    ]),
  )

  return (
    <aside className="library-sidebar" aria-label="Organize">
      <section className="library-side-section">
        <h2>Library</h2>
        <button
          type="button"
          className="library-side-item"
          onClick={onHome}
        >
          <LayoutGrid size={13} strokeWidth={1.75} aria-hidden="true" />
          <span>Collections</span>
        </button>
        <button
          type="button"
          className={`library-side-item${allReferences ? " is-current" : ""}`}
          onClick={() => onCollection(null)}
        >
          <span>All references</span>
          <span className="library-count">{workspace.references.length}</span>
        </button>
      </section>

      <section className="library-side-section">
        <h2>Collections</h2>
        <ul>
          {workspace.collections.map((collection) => (
            <li key={collection.id}>
              <button
                type="button"
                className={`library-side-item${collectionId === collection.id ? " is-current" : ""}`}
                onClick={() => onCollection(collection.id)}
              >
                <Folder size={13} strokeWidth={1.75} aria-hidden="true" />
                <span className="library-side-label">
                  <span>{collection.name}</span>
                  {collection.description ? <small>{collection.description}</small> : null}
                </span>
                <span className="library-count">{collectionCounts[collection.id]}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="library-side-section">
        <h2>Tags</h2>
        <ul>
          {workspace.tags.map((tag) => (
            <li key={tag.id}>
              <button
                type="button"
                className={`library-side-item${tagId === tag.id ? " is-current" : ""}`}
                onClick={() => onTag(tag.id)}
              >
                <Hash size={13} strokeWidth={1.75} aria-hidden="true" />
                <span className="library-side-label">{tag.name}</span>
                <span className="library-count">{tagCounts[tag.id]}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
