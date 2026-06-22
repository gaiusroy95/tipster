import { Link, Outlet } from 'react-router-dom'
import { ROUTES } from '@/core/constants/routes'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to={ROUTES.LOGIN} className="flex flex-col items-center mb-10">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent-secondary to-accent-primary flex items-center justify-center shadow-glow-accent mb-4">
            <span className="font-display font-extrabold text-xl text-bg-primary">TA</span>
          </div>
          <span className="font-display text-2xl font-bold">Tipster Arena</span>
          <span className="text-xs uppercase tracking-[0.2em] text-text-muted mt-2">Virtual tipster league</span>
        </Link>
        <Outlet />
        <p className="mt-10 text-center text-xs text-text-muted leading-relaxed">
          Virtual credits only. No real-money betting. Compete for seasonal prizes.
        </p>
      </div>
    </div>
  )
}
