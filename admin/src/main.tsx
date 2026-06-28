import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { beginAdminShellReady } from '@/app/queryClient'
import { useAuthStore } from '@/features/auth/stores/authStore'
import '@/app/styles/index.css'

async function bootstrap() {
  await useAuthStore.getState().initialize()

  if (useAuthStore.getState().user?.role === 'ADMIN') {
    void beginAdminShellReady()
  }

  const root = document.getElementById('root')
  if (!root) throw new Error('Root element not found')
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

bootstrap()
