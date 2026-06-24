import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { RequestHandler } from 'msw'
import { createConnectMswMiddleware } from './vite/connectMswMiddleware'

type ConnectNext = (err?: unknown) => void
type MswMiddleware = (req: IncomingMessage, res: ServerResponse, next: ConnectNext) => void

function mockApiPlugin(): Plugin {
  return {
    name: 'vite-plugin-mock-api',
    configureServer: (server) => attachMockApi(server),
    configurePreviewServer: (server) => attachMockApi(server as ViteDevServer),
  }
}

async function attachMockApi(server: ViteDevServer) {
  let mswMiddleware: MswMiddleware | null = null

  const loadHandlers = async () => {
    const module = (await server.ssrLoadModule(
      `/src/mocks/handlers/index.ts?t=${Date.now()}`,
    )) as { handlers: RequestHandler[] }
    mswMiddleware = createConnectMswMiddleware(module.handlers)
  }

  await loadHandlers()

  server.middlewares.use((req, res, next) => {
    const pathname = (req.url ?? '').split('?')[0]
    // MSW only for news; all other /api routes go to the Express backend
    if (!pathname.startsWith('/api/news')) {
      next()
      return
    }
    if (!mswMiddleware) {
      next()
      return
    }
    mswMiddleware(req, res, next)
  })

  const reloadMockHandlers = async () => {
    try {
      await loadHandlers()
      server.config.logger.info('[mock-api] handlers reloaded')
    } catch (error) {
      server.config.logger.error(
        `[mock-api] failed to reload handlers: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  server.watcher.on('change', (file) => {
    const normalized = file.replace(/\\/g, '/')
    if (
      normalized.includes('/src/mocks/') ||
      normalized.includes('/src/features/news/')
    ) {
      reloadMockHandlers()
    }
  })
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const enableMsw = env.VITE_ENABLE_MSW === 'true'

  return {
    plugins: [react(), tailwindcss(), enableMsw && mockApiPlugin()].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3000',
          changeOrigin: true,
          bypass(req) {
            const pathname = (req.url ?? '').split('?')[0]
            if (pathname.startsWith('/api/news')) {
              return req.url
            }
            return undefined
          },
        },
        '/sports': {
          target: 'http://127.0.0.1:3000',
          changeOrigin: true,
        },
      },
      watch: {
        // Windows locks temp exports (e.g. ChatGPT Image*.png) and crashes the dev server.
        ignored: [
          '**/ChatGPT Image*.png',
          '**/ChatGPT Image*.jpg',
          // Windows file locks on PNG exports in public/assets crash Vite (EBUSY).
          '**/public/assets/sport-images/**',
        ],
      },
    },
  }
})
