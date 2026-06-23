import { Link, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '@/core/constants/routes'
import { AppLogo } from '@/shared/components/AppLogo'

const COMPACT_AUTH_PATHS = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
] as const

export function AuthLayout() {
  const { pathname } = useLocation()
  const compactAuth = COMPACT_AUTH_PATHS.includes(pathname as (typeof COMPACT_AUTH_PATHS)[number])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {!compactAuth && (
          <Link to={ROUTES.LOGIN} className="flex flex-col items-center mb-10">
            <AppLogo size="lg" variant="full" className="mb-4" />
            <span className="text-xs uppercase tracking-[0.2em] text-text-muted">
              Virtual tipster league
            </span>
          </Link>
        )}
        <Outlet />
        <p className="mt-8 text-center text-xs text-text-muted leading-relaxed">
          Virtual credits only. No real-money betting. Compete for seasonal prizes.
        </p>
      </div>
    </div>
  )
}
