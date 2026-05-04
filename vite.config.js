import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const serveFavicon = (req, res, next) => {
  if (!req.url || !req.url.startsWith('/favicon.ico')) {
    next()
    return
  }

  const icoPath = path.resolve(__dirname, 'emp-logo.ico')
  if (fs.existsSync(icoPath)) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'image/x-icon')
    res.end(fs.readFileSync(icoPath))
    return
  }

  const svgPath = path.resolve(__dirname, 'public', 'emp-logo.ico')
  if (fs.existsSync(svgPath)) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'image/svg+xml')
    res.end(fs.readFileSync(svgPath))
    return
  }

  next()
}

const empleadoFaviconPlugin = () => ({
  name: 'empleado-favicon-plugin',
  configureServer(server) {
    server.middlewares.use(serveFavicon)
  },
  configurePreviewServer(server) {
    server.middlewares.use(serveFavicon)
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), empleadoFaviconPlugin()],
  assetsInclude: ['**/*.xlsx'],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.(js|jsx)$/, // allow both js and jsx in src/
    exclude: [],
  },

  server: {
    host: true,
    allowedHosts: ['entrepreneur-tmp-administered-spoke.trycloudflare.com'],
    ...(process.env.VITE_USE_POLLING === '1'
      ? { watch: { usePolling: true } }
      : {}),
  },
})


