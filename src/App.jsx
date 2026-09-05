import Folder from "./components/Folder.jsx"

/**
 * Static folder composition matching Wade's mock.
 * Positions use % of viewport; clustered in the lower 2/3.
 */
const FOLDERS = [
  {
    id: "agents",
    tab: "Agents",
    variant: "empty",
    left: "4%",
    top: "28%",
    width: "200px",
    zIndex: 2,
  },
  {
    id: "creatives",
    tab: "Creatives",
    variant: "empty",
    left: "18%",
    top: "24%",
    width: "210px",
    zIndex: 3,
  },
  {
    id: "researchers",
    tab: "Researchers",
    variant: "empty",
    left: "62%",
    top: "30%",
    width: "220px",
    zIndex: 3,
  },
  {
    id: "builders",
    tab: "Builders",
    variant: "empty",
    left: "36%",
    top: "58%",
    width: "200px",
    zIndex: 4,
  },
  {
    id: "tagline",
    tab: "",
    hideTab: true,
    body: "Your reference manager for everything that matters.",
    variant: "tagline",
    left: "58%",
    top: "52%",
    width: "300px",
    zIndex: 5,
  },
  {
    id: "personal",
    tab: "Personal knowledge",
    body: "You capture a lot. We help you keep it. Kept is a private workspace for your research, references, and ideas — organized, searchable, and ready when you are.",
    variant: "main",
    left: "28%",
    top: "32%",
    width: "360px",
    zIndex: 10,
  },
]

export default function App() {
  return (
    <>
      <h1 className="logo">kept.</h1>
      {FOLDERS.map((f) => (
        <Folder
          key={f.id}
          id={f.id}
          tab={f.tab}
          body={f.body}
          variant={f.variant}
          hideTab={f.hideTab}
          style={{
            left: f.left,
            top: f.top,
            width: f.width,
            zIndex: f.zIndex,
          }}
        />
      ))}
    </>
  )
}
