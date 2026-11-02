import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// En desarrollo, /api/* corre las mismas funciones que en Vercel.
const api = {
  name: 'api-local',
  configureServer(server) {
    server.middlewares.use('/api', async (req, res) => {
      const ruta = new URL(req.url, 'http://x').pathname.replace(/^\//, '')
      if (!['buscar', 'localidad'].includes(ruta)) return res.writeHead(404).end()
      const { default: handler } = await server.ssrLoadModule(`/api/${ruta}.js`)
      const query = Object.fromEntries(new URL(req.url, 'http://x').searchParams)
      const r = {
        setHeader: (k, v) => res.setHeader(k, v),
        status: (c) => ((res.statusCode = c), r),
        json: (b) => (res.setHeader('Content-Type', 'application/json'), res.end(JSON.stringify(b))),
      }
      await handler({ query }, r)
    })
  },
}

export default defineConfig({
  plugins: [react(), api],
})
