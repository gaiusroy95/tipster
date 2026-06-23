import { Link, Outlet } from 'react-router-dom'
import { AppLogo } from '@/shared/components/AppLogo'
import { SiteFooter } from '@/shared/components/SiteFooter'
import { ROUTES } from '@/core/constants/routes'

export function MinimalLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <header className="border-b border-border-default/70 bg-bg-surface/95">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link to={ROUTES.HOME} className="inline-flex hover:opacity-90 transition-opacity">
            <AppLogo size="sm" />
          </Link>
        </div>
      </header>
      <main className="flex-1 px-4 py-8 max-w-3xl mx-auto w-full">
        <Outlet />
      </main>
      <SiteFooter variant="compact" />
    </div>
  )
}
