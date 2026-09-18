import { useEffect, useMemo, useState } from "react"
import { ChevronRight, Grid2x2, List, LoaderCircle, PanelLeft, Search } from "lucide-react"
import { SiteMasthead } from "../components/SiteMasthead.jsx"
import { LibraryBrowser } from "../components/library/Browser.jsx"
import { CollectionsIndex } from "../components/library/CollectionsIndex.jsx"
import { BulkFiling, LibraryInspector } from "../components/library/Inspector.jsx"
import { LibrarySidebar } from "../components/library/Sidebar.jsx"
import { siteConfig } from "../config/site.js"
import { openWorkspace, queryReferences, summarizeCollections } from "../data/repository.js"
import { pluralize } from "../lib/format.js"
import "./library.css"

/**
 * @typedef {"grid" | "list"} BrowserView
 * @typedef {"loading" | "ready" | "error"} LoadState
 * @typedef {"index" | "operate"} LibrarySurface
 */

export function LibraryPage() {
  const [loadState, setLoadState] = useState(/** @type {LoadState} */ ("loading"))
  const [error, setError] = useState(/** @type {string | null} */ (null))
  const [workspace, setWorkspace] = useState(/** @type {import("../domain/types.js").Workspace | null} */ (null))
  const [query, setQuery] = useState("")
  const [collectionId, setCollectionId] = useState(/** @type {string | null} */ (null))
  const [tagId, setTagId] = useState(/** @type {string | null} */ (null))
  const [status, setStatus] = useState(/** @type {"all" | import("../domain/types.js").ObjectStatus} */ ("all"))
  const [view, setView] = useState(/** @type {BrowserView} */ ("grid"))
  const [selectedIds, setSelectedIds] = useState(/** @type {string[]} */ ([]))
  const [anchorIndex, setAnchorIndex] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [surface, setSurface] = useState(/** @type {LibrarySurface} */ ("index"))
  const [indexQuery, setIndexQuery] = useState("")

  useEffect(() => {
    document.title = `Library — ${siteConfig.name}`
    let cancelled = false
    openWorkspace()
      .then((next) => {
        if (cancelled) return
        setWorkspace(next)
        setLoadState("ready")
      })
      .catch((cause) => {
        if (cancelled) return
        setError(cause instanceof Error ? cause.message : "Could not open the library.")
        setLoadState("error")
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    /**
     * @param {KeyboardEvent} event
     */
    function onKey(event) {
      if (event.key !== "Escape") return
      setSelectedIds([])
      setSidebarOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const visible = useMemo(() => {
    if (!workspace) return []
    return queryReferences(workspace, { query, collectionId, tagId, status })
  }, [workspace, query, collectionId, tagId, status])

  const summaries = useMemo(() => {
    if (!workspace) return []
    return summarizeCollections(workspace, indexQuery)
  }, [workspace, indexQuery])

  const selected = useMemo(() => {
    if (!workspace) return []
    const byId = Object.fromEntries(workspace.references.map((reference) => [reference.id, reference]))
    return selectedIds.map((id) => byId[id]).filter(Boolean)
  }, [workspace, selectedIds])

  /**
   * @param {import("react").MouseEvent} event
   * @param {string} id
   * @param {number} index
   */
  function handleSelect(event, id, index) {
    if (event.shiftKey) {
      const start = Math.min(anchorIndex, index)
      const end = Math.max(anchorIndex, index)
      setSelectedIds(visible.slice(start, end + 1).map((reference) => reference.id))
      return
    }
    if (event.metaKey || event.ctrlKey) {
      setSelectedIds((current) => (
        current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      ))
      setAnchorIndex(index)
      return
    }
    setSelectedIds([id])
    setAnchorIndex(index)
  }

  /**
   * @param {string} id
   */
  function openReference(id) {
    setSelectedIds([id])
    const index = visible.findIndex((reference) => reference.id === id)
    if (index >= 0) setAnchorIndex(index)
  }

  function goIndex() {
    setSurface("index")
    setCollectionId(null)
    setTagId(null)
    setSelectedIds([])
    setQuery("")
    setSidebarOpen(false)
  }

  /**
   * @param {string | null} id
   */
  function openOperateCollection(id) {
    setSurface("operate")
    setCollectionId(id)
    setTagId(null)
    setSelectedIds([])
    setQuery("")
    setSidebarOpen(false)
  }

  /**
   * @param {string | null} id
   */
  function openOperateTag(id) {
    setSurface("operate")
    setTagId(id)
    setCollectionId(null)
    setSelectedIds([])
    setQuery("")
    setSidebarOpen(false)
  }

  const emptyCollection = Boolean(collectionId) && visible.length === 0 && !query && status === "all" && !tagId
  const noResults = visible.length === 0 && !emptyCollection && loadState === "ready"
  const currentCollection = workspace?.collections.find((collection) => collection.id === collectionId)
  const currentTag = workspace?.tags.find((tag) => tag.id === tagId)

  return (
    <div className="library">
      <SiteMasthead
        name={siteConfig.name}
        href={siteConfig.href}
        compact
        secondaryMeta={workspace ? workspace.user.handle : undefined}
      />

      {loadState === "loading" ? (
        <div className="library-state library-state-fill" role="status">
          <LoaderCircle size={16} className="library-spin" aria-hidden="true" />
          <p>Opening library…</p>
        </div>
      ) : null}

      {loadState === "error" ? (
        <div className="library-state library-state-fill" role="alert">
          <p>The library could not be opened.</p>
          <p className="library-state-sub">{error}</p>
          <button type="button" className="library-btn" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      ) : null}

      {loadState === "ready" && workspace && surface === "index" ? (
        <CollectionsIndex
          workspace={workspace}
          summaries={summaries}
          query={indexQuery}
          onQuery={setIndexQuery}
          onChange={setWorkspace}
          onOpen={openOperateCollection}
          onBrowseAll={() => openOperateCollection(null)}
        />
      ) : null}

      {loadState === "ready" && workspace && surface === "operate" ? (
        <div className={`library-shell${sidebarOpen ? " is-sidebar-open" : ""}`}>
          {sidebarOpen ? (
            <button
              type="button"
              className="library-scrim"
              aria-label="Close collections"
              onClick={() => setSidebarOpen(false)}
            />
          ) : null}

          <LibrarySidebar
            workspace={workspace}
            collectionId={collectionId}
            tagId={tagId}
            allReferences={collectionId === null && tagId === null}
            onHome={goIndex}
            onCollection={openOperateCollection}
            onTag={openOperateTag}
          />

          <section className="library-main" aria-label="Reference browser">
            <div className="library-toolbar">
              <button
                type="button"
                className="library-icon-btn library-sidebar-toggle"
                aria-label="Collections"
                onClick={() => setSidebarOpen((open) => !open)}
              >
                <PanelLeft size={15} strokeWidth={1.75} />
              </button>
              <nav className="library-crumb" aria-label="Location">
                <button type="button" className="library-text-btn" onClick={goIndex}>Collections</button>
                <ChevronRight size={12} strokeWidth={1.75} aria-hidden="true" />
                <span>
                  {currentCollection?.name
                    ?? (currentTag ? `#${currentTag.name}` : "All references")}
                </span>
              </nav>
              <label className="library-search">
                <Search size={14} strokeWidth={1.75} aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  placeholder="Search titles, tags, notes, files"
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <label className="library-filter">
                Status
                <select value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="all">All</option>
                  <option value="ready">Ready</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                </select>
              </label>
              <div className="library-view-toggle" role="group" aria-label="Browser view">
                <button
                  type="button"
                  className={view === "grid" ? "is-current" : undefined}
                  aria-pressed={view === "grid"}
                  onClick={() => setView("grid")}
                >
                  <Grid2x2 size={14} strokeWidth={1.75} />
                  Grid
                </button>
                <button
                  type="button"
                  className={view === "list" ? "is-current" : undefined}
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                >
                  <List size={14} strokeWidth={1.75} />
                  List
                </button>
              </div>
            </div>

            {selectedIds.length > 0 ? (
              <div className="library-bulkbar">
                <p>{selectedIds.length} selected</p>
                <BulkFiling compact workspace={workspace} ids={selectedIds} onChange={setWorkspace} />
              </div>
            ) : null}

            <div className="library-browser">
              <LibraryBrowser
                references={visible}
                workspace={workspace}
                view={view}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onClear={() => setSelectedIds([])}
                emptyCollection={emptyCollection}
                noResults={noResults}
                query={query}
              />
            </div>

            <footer className="library-statusbar">
              <span>{pluralize(visible.length, "reference")}</span>
              <span>
                {collectionId
                  ? workspace.collections.find((collection) => collection.id === collectionId)?.name
                  : tagId
                    ? `#${workspace.tags.find((tag) => tag.id === tagId)?.name}`
                    : "All references"}
              </span>
              {selectedIds.length > 0 ? <span>{selectedIds.length} selected</span> : <span>Click to inspect · Shift or ⌘ to multi-select</span>}
            </footer>
          </section>

          <LibraryInspector
            workspace={workspace}
            selected={selected}
            onChange={setWorkspace}
            onOpenReference={openReference}
            onDismiss={() => setSelectedIds([])}
          />
        </div>
      ) : null}
    </div>
  )
}
