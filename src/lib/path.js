export function currentPath() {
  const path = window.location.pathname.replace(/\/+$/, "")
  return path || "/"
}
