import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { siteConfig } from "./src/config/site.js"

export default defineConfig({
  plugins: [
    react(),
    {
      name: "site-metadata",
      transformIndexHtml(html) {
        const escape = (value) => value.replace(/[&<>"']/g, (char) => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char])
        return html
          .replace("%SITE_TITLE%", () => escape(`${siteConfig.name} — ${siteConfig.description}`))
          .replace("%SITE_DESCRIPTION%", () => escape(siteConfig.description))
      },
    },
  ],
  server: {
    host: true,
    port: 5173,
    open: false,
    allowedHosts: true,
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: true,
  },
})
