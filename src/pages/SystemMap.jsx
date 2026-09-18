import { useLayoutEffect, useRef, useState } from "react"
import {
  Bookmark, Boxes, Brain, Cloud, CloudUpload, Copy, Database, Download, Eye, File,
  FileImage, Folder, FolderTree, GitCompareArrows, Grid2x2, HardDrive, Image,
  LayoutDashboard, ListFilter, ListOrdered, Lock, Pencil, Radar, ScanText, Search,
  Server, Share2, Signature, Sparkles, SquareDashed, Tag, User, Zap,
} from "lucide-react"
import { SiteMasthead } from "../components/SiteMasthead.jsx"
import { siteConfig } from "../config/site.js"
import "./system-map.css"

// The diagram is laid out on a fixed stage (coordinates match the 1500px source
// map) and scaled to fit. The offsets trim the source's outer margin and title area.
const STAGE_WIDTH = 1450
const STAGE_HEIGHT = 1300
const OFFSET_X = 25
const OFFSET_Y = 110
const MIN_SCALE = 0.62

const tones = {
  purple: { bg: "#faf5ff", line: "#c4b5fd", ink: "#7c3aed", node: "#ede9fe", sub: "#6d5d9e" },
  blue: { bg: "#f0f9ff", line: "#7dd3fc", ink: "#0369a1", node: "#e0f2fe", sub: "#4b6b85" },
  yellow: { bg: "#fffbeb", line: "#fcd34d", ink: "#b45309", node: "#fef3c7", sub: "#8a6a2e" },
  green: { bg: "#f0fdf4", line: "#86efac", ink: "#047857", node: "#dcfce7", sub: "#3f6b54" },
  gray: { bg: "#f8fafc", line: "#cbd5e1", ink: "#334155", node: "#f1f5f9", sub: "#5b6474" },
  pink: { bg: "#fdf2f8", line: "#f9a8d4", ink: "#be185d", node: "#fce7f3", sub: "#9d4a72" },
}

const edgeColors = {
  blue: "#0369a1",
  orange: "#c2410c",
  green: "#047857",
  gray: "#64748b",
  pink: "#db2777",
}

const groups = [
  { tone: "purple", icon: Sparkles, label: "1 · Product — Capabilities", x: 25, y: 125, w: 1448, h: 168 },
  { tone: "blue", icon: LayoutDashboard, label: "3 · Application — Web App (Next.js)", x: 25, y: 343, w: 836, h: 314 },
  { tone: "yellow", icon: Brain, label: "5 · Intelligence — Enrichment Pipeline", x: 901, y: 343, w: 572, h: 314 },
  { tone: "green", icon: Database, label: "4 · Data — Persistence", x: 25, y: 707, w: 836, h: 300 },
  { tone: "gray", icon: Cloud, label: "6 · Infrastructure", x: 901, y: 707, w: 572, h: 300 },
  { tone: "pink", icon: Boxes, label: "2 · Core Domain — Entity Model", x: 25, y: 1057, w: 1448, h: 350 },
]

const capabilities = [
  [Download, "Capture", "Upload, paste, import"],
  [ListOrdered, "Index", "Extract & enrich"],
  [Signature, "Annotate", "Mark up & comment"],
  [FolderTree, "Organize", "Collections & tags"],
  [Search, "Query", "Keyword & semantic"],
  [Image, "Retrieve", "Browse & recall"],
  [GitCompareArrows, "Connect", "Link related refs"],
].map(([icon, title, sub], i) => ({ tone: "purple", icon, title, sub, x: 53 + i * 190, y: 185, w: 172, h: 88 }))

const nodes = [
  ...capabilities,

  { tone: "blue", icon: Grid2x2, title: "Reference browser", sub: "Grid / feed of refs", x: 53, y: 403, w: 186, h: 82 },
  { tone: "blue", icon: FileImage, title: "Reference detail", sub: "Asset + context", x: 257, y: 403, w: 186, h: 82 },
  { tone: "blue", icon: CloudUpload, title: "Upload / import", sub: "Files, URLs, paste", x: 475, y: 403, w: 186, h: 82 },
  { tone: "blue", icon: Search, title: "Search", sub: "Text + semantic", x: 679, y: 403, w: 162, h: 82 },
  { tone: "blue", icon: Copy, title: "Collections", sub: "Curate & reorder", x: 53, y: 517, w: 186, h: 82 },
  { tone: "blue", icon: Pencil, title: "Annotation interface", sub: "Regions & notes", x: 257, y: 517, w: 186, h: 82 },
  {
    tone: "blue", icon: Server, x: 475, y: 517, w: 366, h: 82, fill: "#dbeafe", stroke: "#93c5fd",
    title: <><b>Server layer</b> — route handlers, server actions</>,
    sub: "Auth session · validation · orchestration of jobs",
  },

  { tone: "yellow", icon: ScanText, title: "OCR", sub: "Text in images", x: 929, y: 403, w: 158, h: 76 },
  { tone: "yellow", icon: Eye, title: "Image understanding", sub: "Captions, objects", x: 1111, y: 403, w: 158, h: 76 },
  { tone: "yellow", icon: ListFilter, title: "Keyword extraction", x: 1297, y: 403, w: 125, h: 76 },
  { tone: "yellow", icon: Tag, title: "Automatic tagging", sub: "Suggested tags", x: 929, y: 511, w: 158, h: 76 },
  { tone: "yellow", icon: SquareDashed, title: "Embeddings", sub: "Image + text vectors", x: 1111, y: 511, w: 158, h: 76 },
  { tone: "yellow", icon: Radar, title: "Semantic search", x: 1297, y: 511, w: 125, h: 76 },

  { tone: "green", kind: "cylinder", icon: Database, title: "PostgreSQL", sub: "Supabase Postgres + pgvector", x: 53, y: 767, w: 210, h: 113 },
  {
    tone: "green", kind: "list", title: "Records", x: 287, y: 767, w: 250, h: 113,
    items: ["Metadata (source, dimensions, EXIF)", "Tags · Annotations · Notes", "Relationships · Collections"],
  },
  { tone: "green", icon: Lock, title: <><b>Authentication</b> — user identity &amp; row&#8209;level access</>, x: 561, y: 767, w: 266, h: 52, inline: true },
  { tone: "green", icon: HardDrive, title: "Object / file storage", sub: "Originals, derivatives, thumbnails", x: 561, y: 843, w: 266, h: 56 },
  { tone: "green", icon: Share2, title: <><b>Vector index</b> — embeddings powering semantic search</>, x: 53, y: 904, w: 484, h: 52, inline: true },

  { tone: "gray", icon: NextMark, title: "Next.js", sub: "App router, server actions, UI", x: 929, y: 767, w: 230, h: 100 },
  { tone: "gray", icon: VercelMark, title: "Vercel", sub: "Hosting, edge, background jobs", x: 1223, y: 767, w: 230, h: 100 },
  { tone: "gray", icon: Zap, iconFill: true, title: "Supabase", sub: "Postgres, auth, storage APIs", x: 929, y: 883, w: 230, h: 100 },
  { tone: "gray", icon: Cloud, iconFill: true, title: "Cloudflare R2", sub: "Asset bucket + CDN delivery", x: 1223, y: 883, w: 230, h: 100 },

  { tone: "pink", icon: Folder, title: "Collection", sub: "curated grouping", x: 295, y: 1107, w: 170, h: 62 },
  { tone: "pink", icon: Image, title: <><b>Asset</b> · stored file + metadata</>, x: 546, y: 1107, w: 190, h: 56, inline: true },
  { tone: "pink", icon: Signature, title: "Annotation", sub: "region on an asset", x: 829, y: 1107, w: 170, h: 62 },
  { tone: "pink", icon: User, title: "User", sub: "owns everything", x: 75, y: 1220, w: 150, h: 74 },
  { tone: "pink", icon: Bookmark, title: "Reference", sub: "the central unit of meaning", x: 546, y: 1208, w: 190, h: 98, fill: "#fbcfe8", stroke: "#f472b6", emphasis: true },
  { tone: "pink", icon: GitCompareArrows, title: "Relationship", sub: "reference ↔ reference typed, directional link", x: 1076, y: 1208, w: 180, h: 98 },
  { tone: "pink", icon: Tag, title: "Tag", sub: "facet / vocabulary", x: 295, y: 1295, w: 170, h: 62 },
  { tone: "pink", icon: File, title: "Note", sub: "free-form context", x: 829, y: 1295, w: 170, h: 62 },
]

// Edges are orthogonal polylines. `start`/`end` decorate the endpoints:
// "arrow", or entity-relationship cardinality "one" / "many".
const edges = [
  { color: "blue", points: [[709, 273], [709, 317], [443, 317], [443, 343]], end: "arrow", label: { text: "expressed as UI", x: 576, y: 317 } },
  { color: "orange", points: [[909, 273], [909, 317], [1187, 317], [1187, 343]], end: "arrow", label: { text: "powered by", x: 1048, y: 317 } },
  { color: "orange", points: [[841, 444], [914, 444], [914, 494], [1360, 494], [1360, 511]], end: "arrow", label: { text: "query", x: 1138, y: 494, bg: "yellow" } },
  { color: "orange", points: [[841, 551], [929, 551]], end: "arrow", label: { text: "enqueue enrichment", x: 885, y: 539 } },
  { color: "green", points: [[568, 485], [568, 501], [458, 501], [458, 683], [549, 683], [549, 827], [694, 827], [694, 843]], end: "arrow", label: { text: "asset bytes", x: 458, y: 627, bg: "blue" } },
  { color: "green", points: [[658, 599], [658, 737], [158, 737], [158, 767]], end: "arrow", label: { text: "read / write domain", x: 409, y: 737, bg: "green" } },
  { color: "green", points: [[1360, 587], [1360, 746], [295, 746], [295, 904]], end: "arrow", label: { text: "nearest neighbours", x: 1363, y: 596, align: "left", bg: "yellow" } },
  { color: "orange", points: [[1190, 587], [1190, 695], [889, 695], [889, 946], [537, 946]], end: "arrow", label: { text: "vectors + derived tags", x: 1193, y: 596, align: "left", bg: "yellow" } },
  { color: "gray", dashed: true, points: [[1044, 767], [1044, 683], [1140, 683], [1140, 657]], end: "arrow", label: { text: "runs", x: 1092, y: 683 } },
  { color: "gray", points: [[1223, 816], [1159, 816]], end: "arrow", label: { text: "hosts", x: 1191, y: 816, bg: "gray" } },
  { color: "gray", dashed: true, points: [[929, 933], [878, 933], [878, 793], [827, 793]], end: "arrow", label: { text: "provides Postgres + auth", x: 878, y: 861 } },
  { color: "gray", dashed: true, points: [[1338, 983], [1338, 995], [694, 995], [694, 899]], end: "arrow", label: { text: "backs storage", x: 1100, y: 995, bg: "gray" } },
  { color: "pink", dashed: true, points: [[412, 880], [412, 968], [749, 968], [749, 1057]], end: "arrow", label: { text: "persists the domain model", x: 415, y: 888, align: "left", bg: "green" } },

  { color: "pink", points: [[465, 1138], [506, 1138], [506, 1233], [546, 1233]], start: "many", end: "many", label: { text: "contains", x: 506, y: 1184, bg: "pink" } },
  { color: "pink", points: [[150, 1220], [150, 1138], [295, 1138]], start: "one", end: "many" },
  { color: "pink", points: [[225, 1257], [546, 1257]], start: "one", end: "many" },
  { color: "pink", points: [[150, 1294], [150, 1326], [295, 1326]], start: "one", end: "many" },
  { color: "pink", points: [[465, 1326], [506, 1326], [506, 1282], [546, 1282]], start: "many", end: "many", label: { text: "labels", x: 486, y: 1313, bg: "pink" } },
  { color: "pink", points: [[641, 1163], [641, 1208]], start: "many", end: "one", label: { text: "has 1..n", x: 641, y: 1184, bg: "pink" } },
  { color: "pink", points: [[736, 1134], [829, 1134]], start: "one", end: "many", label: { text: "marked on", x: 783, y: 1134, bg: "pink" } },
  { color: "pink", points: [[736, 1257], [1076, 1257]], end: "many", label: { text: "source / target", x: 906, y: 1257, bg: "pink" } },
  { color: "pink", points: [[999, 1138], [1023, 1138], [1023, 1326], [999, 1326]], end: "many", label: { text: "can carry", x: 1023, y: 1231, bg: "pink" } },
  { color: "pink", points: [[641, 1306], [641, 1326], [829, 1326]], start: "one", end: "many" },
]

export function SystemMapPage() {
  const viewportRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [overflowing, setOverflowing] = useState(false)

  useLayoutEffect(() => {
    document.title = `System Map — ${siteConfig.name}`
    const element = viewportRef.current
    const update = () => {
      const fit = element.clientWidth / STAGE_WIDTH
      setScale(Math.min(1, Math.max(MIN_SCALE, fit)))
      setOverflowing(fit < MIN_SCALE)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="page map-page">
      <SiteMasthead
        name={siteConfig.name}
        description={siteConfig.description}
        meta={siteConfig.status}
        href={siteConfig.href}
      />
      <main className="map-main">
        <header className="map-header">
          <h2>Kept — System Map</h2>
          <p>
            A personal reference database for collecting, organizing,
            contextualizing, and retrieving visual references.
          </p>
        </header>
        {overflowing ? <p className="map-hint">Scroll to explore the map →</p> : null}
        <div className="map-viewport" ref={viewportRef}>
          <div style={{ width: STAGE_WIDTH * scale, height: STAGE_HEIGHT * scale }}>
            <div
              className="map-stage"
              style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT, transform: `scale(${scale})` }}
            >
              <div className="map-canvas" style={{ left: -OFFSET_X, top: -OFFSET_Y }}>
                {groups.map((group) => <Group key={group.label} {...group} />)}
                <Edges />
                {nodes.map((node, i) => <Node key={i} {...node} />)}
                {edges.map((edge, i) => edge.label ? <EdgeLabel key={i} color={edge.color} {...edge.label} /> : null)}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function Group({ tone, icon: Icon, label, x, y, w, h }) {
  const t = tones[tone]
  return (
    <section
      className="map-group"
      style={{ left: x, top: y, width: w, height: h, background: t.bg, borderColor: t.line, color: t.ink }}
      aria-label={label}
    >
      <h3><Icon size={14} strokeWidth={1.75} aria-hidden="true" />{label}</h3>
    </section>
  )
}

function Node({ tone, kind, icon: Icon, iconFill, title, sub, items, inline, emphasis, fill, stroke, x, y, w, h }) {
  const t = tones[tone]
  const box = { left: x, top: y, width: w, height: h }
  const background = fill ?? t.node
  const borderColor = stroke ?? t.line

  if (kind === "list") {
    return (
      <div className="map-node map-node--list" style={{ ...box, background, borderColor }}>
        <strong>{title}</strong>
        <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
    )
  }

  const content = (
    <>
      {Icon ? (
        <span className="map-node-icon">
          <Icon size={18} strokeWidth={1.6} fill={iconFill ? "currentColor" : "none"} aria-hidden="true" />
        </span>
      ) : null}
      <span className={`map-node-text${emphasis ? " is-emphasis" : ""}`}>
        {inline ? <span className="map-node-inline">{title}</span> : <strong>{title}</strong>}
        {sub ? <span className="map-node-sub" style={{ color: t.sub }}>{sub}</span> : null}
      </span>
    </>
  )

  if (kind === "cylinder") {
    return (
      <div className="map-node map-node--cylinder" style={box}>
        <svg width={w} height={h} aria-hidden="true">
          <path
            d={`M1 14 V${h - 14} A${w / 2 - 1} 13 0 0 0 ${w - 1} ${h - 14} V14`}
            fill={background}
            stroke={borderColor}
          />
          <ellipse cx={w / 2} cy={14} rx={w / 2 - 1} ry={13} fill={background} stroke={borderColor} />
        </svg>
        <div className="map-node-body">{content}</div>
      </div>
    )
  }

  return (
    <div className="map-node" style={{ ...box, background, borderColor, "--shadow": borderColor }}>
      {content}
    </div>
  )
}

function Edges() {
  return (
    <svg className="map-edges" width={STAGE_WIDTH + OFFSET_X} height={STAGE_HEIGHT + OFFSET_Y} aria-hidden="true">
      <defs>
        {Object.entries(edgeColors).map(([name, color]) => (
          <marker
            key={name}
            id={`map-arrow-${name}`}
            viewBox="0 0 8 8"
            refX="8"
            refY="4"
            markerWidth="8"
            markerHeight="8"
            markerUnits="userSpaceOnUse"
            orient="auto"
          >
            <path d="M0 0 L8 4 L0 8 z" fill={color} />
          </marker>
        ))}
      </defs>
      {edges.map((edge, i) => {
        const color = edgeColors[edge.color]
        const { points } = edge
        return (
          <g key={i} stroke={color} fill="none" strokeWidth="1.25">
            <polyline
              points={points.map((p) => p.join(",")).join(" ")}
              strokeDasharray={edge.dashed ? "6 5" : undefined}
              markerEnd={edge.end === "arrow" ? `url(#map-arrow-${edge.color})` : undefined}
            />
            {edge.start ? <Cardinality kind={edge.start} at={points[0]} from={points[1]} /> : null}
            {edge.end && edge.end !== "arrow" ? (
              <Cardinality kind={edge.end} at={points.at(-1)} from={points.at(-2)} />
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}

// Draws an entity-relationship mark where an edge meets a node. `from` is the
// neighbouring point, so the mark is oriented along the final segment.
function Cardinality({ kind, at, from }) {
  const length = Math.hypot(at[0] - from[0], at[1] - from[1])
  const d = [(at[0] - from[0]) / length, (at[1] - from[1]) / length]
  const p = [-d[1], d[0]]
  const point = (back, side) => `${at[0] - d[0] * back + p[0] * side},${at[1] - d[1] * back + p[1] * side}`

  if (kind === "one") {
    return <path d={`M${point(8, -5)} L${point(8, 5)}`} />
  }
  return <path d={`M${point(0, -5)} L${point(9, 0)} L${point(0, 5)}`} />
}

function EdgeLabel({ text, x, y, color, align = "center", bg }) {
  return (
    <span
      className={`map-edge-label map-edge-label--${align}`}
      style={{ left: x, top: y, color: edgeColors[color], background: bg ? tones[bg].bg : "var(--paper)" }}
    >
      {text}
    </span>
  )
}

function NextMark(props) {
  return (
    <svg viewBox="0 0 18 18" width={props.size} height={props.size} aria-hidden="true">
      <circle cx="9" cy="9" r="9" fill="#111827" />
      <path d="M6.4 12.5V5.5l5.6 7.4M11.6 5.5v4.6" stroke="#ffffff" strokeWidth="1.3" fill="none" />
    </svg>
  )
}

function VercelMark(props) {
  return (
    <svg viewBox="0 0 18 18" width={props.size} height={props.size} aria-hidden="true">
      <path d="M9 2.5 16.5 15.5h-15z" fill="#111827" />
    </svg>
  )
}
