import { QueryClient } from '@tanstack/react-query'
import { ensureAdminShellReady } from '@/app/ensureAdminShellReady'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

let shellReadyTask: Promise<void> | null = null

export function beginAdminShellReady(): Promise<void> {
  if (!shellReadyTask) {
    shellReadyTask = ensureAdminShellReady(queryClient)
  }
  return shellReadyTask
}
