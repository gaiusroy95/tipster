import { Outlet } from 'react-router-dom'
import { ADMIN_TAGLINE } from '@/core/constants/branding'

export function AuthLayout() {
  return (
    <div className="relative min-h-screen auth-backdrop safe-area-pt safe-area-pb">
      <div className="pointer-events-none absolute inset-0 auth-grid-overlay opacity-40" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-accent-secondary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-accent-primary/5 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <Outlet />
          <p className="mt-8 text-center text-xs leading-relaxed text-text-muted">
            {ADMIN_TAGLINE} · Tipster Arena
          </p>
        </div>
      </div>
    </div>
  )
}
