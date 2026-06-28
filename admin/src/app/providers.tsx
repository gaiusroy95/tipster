import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from '@/app/router'
import { queryClient } from '@/app/queryClient'

export function Providers({ children }: { children?: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children ?? <AppRouter />}</BrowserRouter>
    </QueryClientProvider>
  )
}
