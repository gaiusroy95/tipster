import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { LoadingScreen } from '@/shared/components/LoadingScreen'

export function AdminRoute() {
  const user = useAuthStore((s) => s.user)
  const isInitialized = useAuthStore((s) => s.isInitialized)

  if (!isInitialized) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-2">
          <h1 className="text-xl font-bold">Access denied</h1>
          <p className="text-text-muted">This account does not have admin privileges.</p>
        </div>
      </div>
    )
  }

  return <Outlet />
}

export function GuestRoute() {
  const user = useAuthStore((s) => s.user)
  const isInitialized = useAuthStore((s) => s.isInitialized)

  if (!isInitialized) {
    return <LoadingScreen />
  }

  if (user?.role === 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
