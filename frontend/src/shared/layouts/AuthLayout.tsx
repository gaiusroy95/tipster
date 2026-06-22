import { Link, Outlet } from 'react-router-dom'
import { ROUTES } from '@/core/constants/routes'
import { AppLogo } from '@/shared/components/AppLogo'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to={ROUTES.LOGIN} className="flex flex-col items-center mb-10">
          <AppLogo size="lg" className="mb-4" />
          <span className="text-xs uppercase tracking-[0.2em] text-text-muted">
            Virtual tipster league
          </span>
        </Link>
        <Outlet />
        <p className="mt-10 text-center text-xs text-text-muted leading-relaxed">
          Virtual credits only. No real-money betting. Compete for seasonal prizes.
        </p>
      </div>
    </div>
  )
}
