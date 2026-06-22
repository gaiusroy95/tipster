import { Link, Outlet, useLocation } from 'react-router-dom'
import { useState, type ReactNode } from 'react'
import {
  HomeIcon,
  TicketIcon,
  TrophyIcon,
  WalletIcon,
  BellIcon,
  Cog6ToothIcon,
  UserIcon,
  ChartBarIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { ROUTES } from '@/core/constants/routes'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useBetSlipStore } from '@/features/betting/stores/betSlipStore'
import { formatCredits } from '@/shared/utils/formatCredits'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { SideDrawer } from '@/shared/components/ui/SideDrawer'
import { SportsNavSidebar } from '@/features/fixtures/components/SportsNavSidebar'
import { SportsNavDrawerProvider } from '@/features/fixtures/context/SportsNavDrawerContext'
import { BetSlipStickyBar } from '@/features/betting/components/BetSlipStickyBar'
import { MobileBottomNav, MobileMoreMenu } from '@/shared/layouts/MobileNav'
import { AppLogo } from '@/shared/components/AppLogo'

const topNav = [
  {
    to: ROUTES.HOME,
    label: 'Arena',
    icon: HomeIcon,
    match: (pathname: string, search: string) =>
      pathname === ROUTES.HOME && !search.includes('tab=cup'),
  },
  {
    to: `${ROUTES.HOME}?tab=cup`,
    label: 'Matches',
    icon: ChartBarIcon,
    match: (pathname: string, search: string) =>
      pathname.startsWith('/fixtures') ||
      (pathname === ROUTES.HOME && search.includes('tab=cup')),
  },
  {
    to: ROUTES.LEADERBOARD,
    label: 'Rankings',
    icon: TrophyIcon,
    match: (pathname: string) =>
      pathname.startsWith('/leaderboard') || pathname.startsWith('/players'),
  },
  {
    to: ROUTES.WALLET,
    label: 'Wallet',
    icon: WalletIcon,
    match: (pathname: string) => pathname === ROUTES.WALLET,
  },
]

function HeaderIconLink({
  to,
  label,
  children,
  className,
}: {
  to: string
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-surface hover:text-text-primary',
        className,
      )}
    >
      {children}
    </Link>
  )
}

export function MainLayout() {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const slipCount = useBetSlipStore((s) => s.selections.length)
  const [moreOpen, setMoreOpen] = useState(false)
  const [sportsNavOpen, setSportsNavOpen] = useState(false)
  const pathname = location.pathname
  const search = location.search

  return (
    <SportsNavDrawerProvider
      open={() => setSportsNavOpen(true)}
      close={() => setSportsNavOpen(false)}
    >
      <div className="min-h-screen">
        <header className="sticky top-0 z-40 border-b border-border-default/70 bg-bg-surface/95 backdrop-blur-md safe-area-pt">
          <div className="max-w-[1600px] mx-auto flex items-center gap-3 sm:gap-4 min-h-14 sm:min-h-[60px] py-2 px-4 lg:px-6">
            <div className="flex items-center gap-1.5 min-w-0 shrink-0">
              <button
                type="button"
                onClick={() => setSportsNavOpen(true)}
                className="xl:hidden flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-bg-elevated hover:text-text-primary transition-colors"
                aria-label="Open sports menu"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
              <Link
                to={ROUTES.HOME}
                className="hidden xl:flex items-center min-w-0 rounded-lg py-1 pr-2 hover:opacity-90 transition-opacity"
              >
                <AppLogo size="sm" />
              </Link>
            </div>

            <nav
              className="hidden md:flex flex-1 justify-center min-w-0"
              aria-label="Primary"
            >
              <div className="inline-flex items-center gap-0.5 rounded-xl border border-border-default/60 bg-bg-elevated/50 p-1">
                {topNav.map((item) => {
                  const active = item.match(pathname, search)
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      className={cn(
                        'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium min-h-[36px] transition-colors',
                        active
                          ? 'bg-bg-surface text-text-primary shadow-sm'
                          : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/60',
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </nav>

            <div className="flex items-center justify-end gap-2 shrink-0 ml-auto">
              {user ? (
                <div
                  className="flex items-center gap-1 rounded-xl border border-border-default/60 bg-bg-elevated/40 p-1"
                >
                  <Link
                    to={ROUTES.BET_SLIP}
                    className="relative flex items-center gap-2 rounded-lg px-2.5 sm:px-3 py-1.5 text-sm font-semibold min-h-[36px] hover:bg-bg-surface transition-colors"
                    aria-label={`Bet slip, balance ${formatCredits(user.balance)}`}
                  >
                    <TicketIcon className="h-4 w-4 text-accent-primary shrink-0" aria-hidden="true" />
                    <span className="font-mono text-xs sm:text-sm tabular-nums">
                      {formatCredits(user.balance)}
                    </span>
                    {slipCount > 0 && (
                      <Badge variant="live" className="absolute -top-1.5 -right-1 min-w-[18px] h-[18px] text-[10px]">
                        {slipCount}
                      </Badge>
                    )}
                  </Link>
                  <div className="hidden sm:block h-6 w-px bg-border-default/80 mx-0.5" aria-hidden="true" />
                  <div className="flex items-center gap-0.5">
                    <HeaderIconLink to={ROUTES.NOTIFICATIONS} label="Notifications">
                      <BellIcon className="h-[18px] w-[18px]" />
                    </HeaderIconLink>
                    <HeaderIconLink
                      to={ROUTES.SETTINGS}
                      label="Settings"
                      className="hidden sm:flex"
                    >
                      <Cog6ToothIcon className="h-[18px] w-[18px]" />
                    </HeaderIconLink>
                    <HeaderIconLink
                      to={ROUTES.PROFILE_EDIT}
                      label="Profile"
                      className="hidden sm:flex"
                    >
                      <UserIcon className="h-[18px] w-[18px]" />
                    </HeaderIconLink>
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="hidden lg:flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-bg-surface hover:text-text-primary transition-colors"
                      aria-label="Log out"
                    >
                      <ArrowRightOnRectangleIcon className="h-[18px] w-[18px]" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to={ROUTES.REGISTER}
                    className="hidden sm:inline-flex text-sm font-medium text-text-muted hover:text-text-primary px-2 py-2 min-h-[36px] items-center transition-colors"
                  >
                    Register
                  </Link>
                  <Link to={ROUTES.LOGIN}>
                    <Button size="sm" className="min-h-[36px] px-4">
                      Sign in
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <div className="flex gap-6 lg:gap-8">
            <aside className="hidden xl:block w-[240px] shrink-0">
              <SportsNavSidebar />
            </aside>
            <main
              className={cn(
                'flex-1 min-w-0 xl:pb-0',
                slipCount > 0
                  ? 'pb-[calc(var(--layout-sticky-offset)+3.5rem)]'
                  : 'pb-layout-nav',
              )}
            >
              <Outlet />
            </main>
          </div>
        </div>

        <BetSlipStickyBar />
        <MobileBottomNav onMoreOpen={() => setMoreOpen(true)} />
        <MobileMoreMenu open={moreOpen} onClose={() => setMoreOpen(false)} />

        <SideDrawer
          open={sportsNavOpen}
          onClose={() => setSportsNavOpen(false)}
          header={
            <Link
              to={ROUTES.HOME}
              onClick={() => setSportsNavOpen(false)}
              className="inline-flex min-w-0 hover:opacity-90 transition-opacity"
            >
              <AppLogo size="sidebar" />
            </Link>
          }
        >
          <SportsNavSidebar onNavigate={() => setSportsNavOpen(false)} />
        </SideDrawer>
      </div>
    </SportsNavDrawerProvider>
  )
}
