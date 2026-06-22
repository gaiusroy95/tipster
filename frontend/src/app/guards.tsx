import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { ROUTES } from '@/core/constants/routes'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const location = useLocation()

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
      </div>
    )
  }

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const isInitialized = useAuthStore((s) => s.isInitialized)

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
      </div>
    )
  }

  if (token) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <>{children}</>
}
