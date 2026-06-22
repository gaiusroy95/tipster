import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { env } from '@/core/config/env'
import '@/app/styles/index.css'

/** Remove stale MSW service workers that cause passthrough / Failed to fetch errors. */
async function unregisterStaleServiceWorkers() {
  if (!('serviceWorker' in navigator)) return
  const registrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(registrations.map((registration) => registration.unregister()))
}

/**
 * Local dev: API mocks run via Vite middleware (vite.config.ts).
 * Production (e.g. Vercel): static hosting has no middleware — start the browser MSW worker.
 */
async function setupApiMocking() {
  if (!env.enableMsw) return

  if (env.isDev) {
    await unregisterStaleServiceWorkers()
    return
  }

  const { worker } = await import('@/mocks/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  })
}

async function bootstrap() {
  await setupApiMocking()
  await useAuthStore.getState().initialize()

  const root = document.getElementById('root')
  if (!root) throw new Error('Root element not found')

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

bootstrap()
