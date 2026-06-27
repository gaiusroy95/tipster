import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { RouterProvider } from 'react-router-dom'
import { ToastProvider } from '@/shared/components/ui/Toast'
import { router } from '@/app/router'
import { env } from '@/core/config/env'
import { useCurationRevisionSync } from '@/features/fixtures/hooks/useCurationRevisionSync'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function CurationRevisionSync() {
  useCurationRevisionSync()
  return null
}

export function Providers() {
  const app = (
    <QueryClientProvider client={queryClient}>
      <CurationRevisionSync />
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  )

  if (!env.googleClientId || !env.googleUseGsi) {
    return app
  }

  return <GoogleOAuthProvider clientId={env.googleClientId}>{app}</GoogleOAuthProvider>
}
