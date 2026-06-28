import { QueryClient } from '@tanstack/react-query'
import { ensureAppShellReady } from '@/app/ensureAppShellReady'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

let shellReadyTask: Promise<void> | null = null

/** Start (or await) the splash-screen data load. Safe to call multiple times. */
export function beginAppShellReady(): Promise<void> {
  if (!shellReadyTask) {
    shellReadyTask = ensureAppShellReady(queryClient)
  }
  return shellReadyTask
}
