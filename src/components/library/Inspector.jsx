import { useState } from "react"
import { X } from "lucide-react"
import { assetRoleLabel, captureLabel, relationshipLabel, statusLabel } from "../../domain/types.js"
import { formatBytes, formatDate, formatDimensions, pluralize } from "../../lib/format.js"
import { applyTag, addToCollection, removeFromCollection, removeTag } from "../../data/repository.js"

/**
 * @param {object} props
 * @param {import("../../domain/types.js").Workspace} props.workspace
 * @param {import("../../domain/types.js").Reference[]} props.selected
 * @param {(workspace: import("../../domain/types.js").Workspace) => void} props.onChange
 * @param {(id: string) => void} props.onOpenReference
 * @param {() => void} props.onDismiss
 */
export function LibraryInspector({ workspace, selected, onChange, onOpenReference, onDismiss }) {
  if (selected.length === 0) {
    return (
      <aside className="library-inspector" aria-label="Inspector">
        <div className="library-inspector-empty">
          <p>Select a reference</p>
          <p className="library-state-sub">
            Inspector shows everything Kept knows about the record — assets, filing, notes, relationships — and the index fields that are still empty.
          </p>
        </div>
      </aside>
    )
  }

  if (selected.length > 1) {
    return (
      <aside className="library-inspector" aria-label="Inspector">
        <header className="library-inspector-head">
          <DismissButton onDismiss={onDismiss} />
          <p className="library-kicker">Selection</p>
          <h2>{pluralize(selected.length, "reference")}</h2>
        </header>
        <BulkFiling workspace={workspace} ids={selected.map((reference) => reference.id)} onChange={onChange} />
        <section className="library-section">
          <h3>In this selection</h3>
          <ul className="library-plain-list">
            {selected.map((reference) => (
              <li key={reference.id}>
                <button type="button" className="library-text-btn" onClick={() => onOpenReference(reference.id)}>
                  {reference.title}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    )
  }

  const reference = selected[0]
  const assets = workspace.assets.filter((asset) => asset.referenceId === reference.id)
  const notes = workspace.notes.filter((note) => note.referenceId === reference.id)
  const relationships = workspace.relationships.filter(
    (relationship) => relationship.sourceId === reference.id || relationship.targetId === reference.id,
  )
  const collectionsById = Object.fromEntries(workspace.collections.map((collection) => [collection.id, collection]))
  const tagsById = Object.fromEntries(workspace.tags.map((tag) => [tag.id, tag]))
  const referencesById = Object.fromEntries(workspace.references.map((item) => [item.id, item]))
  const primary = assets.find((asset) => asset.role === "original") ?? assets[0]

  return (
    <aside className="library-inspector" aria-label="Inspector">
      <header className="library-inspector-head">
        <DismissButton onDismiss={onDismiss} />
        <p className="library-kicker">Reference</p>
        <h2>{reference.title}</h2>
        <p className="library-inspector-sub">
          <StatusMark status={reference.status} />
          <span>{captureLabel(reference.capturedVia)}</span>
          <span>{formatDate(reference.createdAt)}</span>
        </p>
      </header>

      <div className="library-inspector-preview">
        {primary?.preview && reference.status === "ready" ? (
          <img src={primary.preview} alt="" />
        ) : (
          <div className="library-thumb is-processing library-thumb-lg">
            <span>{statusLabel(reference.status)}</span>
          </div>
        )}
      </div>

      <section className="library-section">
        <h3>Record</h3>
        <dl className="library-fields">
          <div>
            <dt>Status</dt>
            <dd>{statusLabel(reference.status)}</dd>
          </div>
          <div>
            <dt>Captured</dt>
            <dd>{captureLabel(reference.capturedVia)}</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>
              {reference.sourceUrl ? (
                <a href={reference.sourceUrl} target="_blank" rel="noreferrer">
                  {reference.sourceUrl.replace(/^https?:\/\//, "")}
                </a>
              ) : (
                "Local capture"
              )}
            </dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{formatDate(reference.updatedAt)}</dd>
          </div>
          <div>
            <dt>Owner</dt>
            <dd>{workspace.user.handle}</dd>
          </div>
        </dl>
      </section>

      <section className="library-section">
        <h3>Assets · {assets.length}</h3>
        {assets.length === 0 ? (
          <p className="library-muted">No stored files on this reference.</p>
        ) : (
          <ul className="library-asset-list">
            {assets.map((asset) => (
              <li key={asset.id}>
                <span className="library-asset-name">{asset.filename}</span>
                <span className="library-muted">
                  {assetRoleLabel(asset.role)} · {asset.mimeType} · {formatDimensions(asset.width, asset.height)} · {formatBytes(asset.byteSize)} · {statusLabel(asset.status)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="library-section">
        <h3>Collections</h3>
        <ChipList
          assigned={reference.collectionIds.map((id) => collectionsById[id]).filter(Boolean)}
          onRemove={(id) => onChange(removeFromCollection([reference.id], id))}
        />
        <FilingSelect
          label="Add to collection"
          options={workspace.collections.filter((collection) => !reference.collectionIds.includes(collection.id))}
          onPick={(id) => onChange(addToCollection([reference.id], id))}
        />
      </section>

      <section className="library-section">
        <h3>Tags</h3>
        <ChipList
          assigned={reference.tagIds.map((id) => tagsById[id]).filter(Boolean)}
          onRemove={(id) => onChange(removeTag([reference.id], id))}
        />
        <FilingSelect
          label="Apply tag"
          options={workspace.tags.filter((tag) => !reference.tagIds.includes(tag.id))}
          onPick={(id) => onChange(applyTag([reference.id], id))}
        />
      </section>

      <section className="library-section">
        <h3>Notes</h3>
        {notes.length === 0 ? (
          <p className="library-muted">No notes yet.</p>
        ) : (
          <ul className="library-note-list">
            {notes.map((note) => (
              <li key={note.id}>
                <p>{note.body}</p>
                <time dateTime={note.createdAt}>{formatDate(note.createdAt)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="library-section">
        <h3>Relationships</h3>
        {relationships.length === 0 ? (
          <p className="library-muted">No typed links from this reference.</p>
        ) : (
          <ul className="library-rel-list">
            {relationships.map((relationship) => {
              const outbound = relationship.sourceId === reference.id
              const otherId = outbound ? relationship.targetId : relationship.sourceId
              const other = referencesById[otherId]
              return (
                <li key={relationship.id}>
                  <button type="button" className="library-text-btn" onClick={() => onOpenReference(otherId)}>
                    {other?.title ?? otherId}
                  </button>
                  <span className="library-muted">
                    {outbound ? "→" : "←"} {relationshipLabel(relationship.type)}
                    {relationship.note ? ` · ${relationship.note}` : ""}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="library-section">
        <h3>Index</h3>
        <p className="library-state-sub">Reserved for a later pipeline. Empty on purpose — nothing is inferred yet.</p>
        <dl className="library-fields">
          <div>
            <dt>Keywords</dt>
            <dd className="is-empty">{reference.keywords.length ? reference.keywords.join(", ") : "—"}</dd>
          </div>
          <div>
            <dt>Description</dt>
            <dd className="is-empty">{reference.description || "—"}</dd>
          </div>
          <div>
            <dt>OCR</dt>
            <dd className="is-empty">{reference.ocrText || "—"}</dd>
          </div>
          <div>
            <dt>Embedding</dt>
            <dd className="is-empty">{reference.embedding == null ? "null" : "present"}</dd>
          </div>
        </dl>
      </section>
    </aside>
  )
}

/**
 * @param {object} props
 * @param {import("../../domain/types.js").Workspace} props.workspace
 * @param {string[]} props.ids
 * @param {(workspace: import("../../domain/types.js").Workspace) => void} props.onChange
 * @param {boolean} [props.compact]
 */
export function BulkFiling({ workspace, ids, onChange, compact = false }) {
  const fields = (
    <>
      <FilingSelect
        label="Add to collection"
        options={workspace.collections}
        onPick={(id) => onChange(addToCollection(ids, id))}
      />
      <FilingSelect
        label="Apply tag"
        options={workspace.tags}
        onPick={(id) => onChange(applyTag(ids, id))}
      />
    </>
  )

  if (compact) return <div className="library-bulk-fields">{fields}</div>

  return (
    <section className="library-section">
      <h3>Bulk actions</h3>
      {fields}
    </section>
  )
}

function ChipList({ assigned, onRemove }) {
  if (assigned.length === 0) {
    return <p className="library-muted">None.</p>
  }
  return (
    <ul className="library-chips">
      {assigned.map((item) => (
        <li key={item.id}>
          <span>{item.name}</span>
          <button type="button" aria-label={`Remove ${item.name}`} onClick={() => onRemove(item.id)}>
            ×
          </button>
        </li>
      ))}
    </ul>
  )
}

function FilingSelect({ label, options, onPick }) {
  const [cycle, setCycle] = useState(0)
  return (
    <label className="library-inline-label">
      {label}
      <select
        key={cycle}
        defaultValue=""
        onChange={(event) => {
          const value = event.target.value
          if (!value) return
          onPick(value)
          setCycle((current) => current + 1)
        }}
      >
        <option value="">Choose…</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  )
}

function StatusMark({ status }) {
  return <span className={`library-status is-${status}`}>{statusLabel(status)}</span>
}

function DismissButton({ onDismiss }) {
  return (
    <button type="button" className="library-icon-btn library-inspector-close" aria-label="Close inspector" onClick={onDismiss}>
      <X size={14} strokeWidth={1.75} />
    </button>
  )
}
