import { Link, Outlet, useLocation } from 'react-router-dom'
import { AppLogo } from '@/shared/components/AppLogo'
import { SiteFooter } from '@/shared/components/SiteFooter'
import { ROUTES } from '@/core/constants/routes'
import { cn } from '@/shared/utils/cn'

const NO_HEADER_PATHS = [ROUTES.TERMS, ROUTES.PRIVACY, ROUTES.RULES] as const

export function MinimalLayout() {
  const { pathname } = useLocation()
  const hideHeader = NO_HEADER_PATHS.includes(pathname as (typeof NO_HEADER_PATHS)[number])

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      {!hideHeader && (
        <header className="border-b border-border-default/70 bg-bg-surface/95">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <Link to={ROUTES.HOME} className="inline-flex hover:opacity-90 transition-opacity">
              <AppLogo size="sm" />
            </Link>
          </div>
        </header>
      )}
      <main
        className={cn(
          'flex-1 px-4 py-8 w-full mx-auto',
          hideHeader ? 'max-w-6xl' : 'max-w-3xl',
        )}
      >
        <Outlet />
      </main>
      <SiteFooter variant="compact" />
    </div>
  )
}
