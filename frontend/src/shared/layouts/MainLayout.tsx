import { Link, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  HomeIcon,
  TicketIcon,
  TrophyIcon,
  WalletIcon,
  BellIcon,
  Cog6ToothIcon,
  UserIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { ROUTES } from '@/core/constants/routes'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useBetSlipStore } from '@/features/betting/stores/betSlipStore'
import { formatCredits } from '@/shared/utils/formatCredits'
import { Badge } from '@/shared/components/ui/Badge'
import { SportsNavSidebar } from '@/features/fixtures/components/SportsNavSidebar'
import { BetSlipStickyBar } from '@/features/betting/components/BetSlipStickyBar'
import { MobileBottomNav, MobileMoreMenu } from '@/shared/layouts/MobileNav'

const topNav = [
  {
    to: ROUTES.HOME,
    label: 'Arena',
    icon: HomeIcon,
    match: (pathname: string) => pathname === ROUTES.HOME,
  },
  {
    to: `${ROUTES.HOME}?tab=cup`,
    label: 'Matches',
    icon: ChartBarIcon,
    match: (pathname: string, search: string) =>
      pathname.startsWith('/fixtures') ||
      (pathname === ROUTES.HOME && (search.includes('tab=cup') || search === '')),
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

export function MainLayout() {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const slipCount = useBetSlipStore((s) => s.selections.length)
  const [moreOpen, setMoreOpen] = useState(false)
  const pathname = location.pathname
  const search = location.search

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border-default bg-bg-surface safe-area-pt">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between h-14 sm:h-16 px-4 lg:px-6 gap-3">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-accent-secondary to-accent-primary flex items-center justify-center shadow-glow-accent shrink-0">
              <span className="font-display font-extrabold text-bg-primary text-sm">TA</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-display font-bold text-base leading-none">Tipster Arena</p>
              <p className="text-xs text-text-muted mt-0.5">Virtual competition</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
            {topNav.map((item) => {
              const active = item.match(pathname, search)
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold min-h-[44px] transition-colors',
                    active
                      ? 'bg-accent-secondary/15 text-accent-secondary'
                      : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated/60',
                  )}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {user && (
              <>
                <Link
                  to={ROUTES.BET_SLIP}
                  className="relative flex items-center gap-2 rounded-xl border border-border-default bg-bg-elevated/80 px-2.5 sm:px-3 py-2 text-sm font-semibold min-h-[44px] hover:border-accent-primary/50 transition-colors"
                  aria-label={`Bet slip, balance ${formatCredits(user.balance)}`}
                >
                  <TicketIcon className="h-4 w-4 text-accent-primary shrink-0" aria-hidden="true" />
                  <span className="font-mono text-xs sm:text-sm max-w-[72px] sm:max-w-none truncate">
                    {formatCredits(user.balance)}
                  </span>
                  {slipCount > 0 && (
                    <Badge variant="live" className="absolute -top-2 -right-2 min-w-[20px] h-5">
                      {slipCount}
                    </Badge>
                  )}
                </Link>
                <Link
                  to={ROUTES.NOTIFICATIONS}
                  className="p-2.5 rounded-xl hover:bg-bg-elevated min-h-[44px] min-w-[44px] flex items-center justify-center text-text-muted hover:text-text-primary"
                  aria-label="Notifications"
                >
                  <BellIcon className="h-5 w-5" />
                </Link>
                <Link
                  to={ROUTES.SETTINGS}
                  className="p-2.5 rounded-xl hover:bg-bg-elevated min-h-[44px] min-w-[44px] flex items-center justify-center text-text-muted hover:text-text-primary hidden sm:flex"
                  aria-label="Settings"
                >
                  <Cog6ToothIcon className="h-5 w-5" />
                </Link>
                <Link
                  to={ROUTES.PROFILE_EDIT}
                  className="p-2.5 rounded-xl hover:bg-bg-elevated min-h-[44px] min-w-[44px] flex items-center justify-center text-text-muted hover:text-text-primary hidden sm:flex"
                  aria-label="Profile"
                >
                  <UserIcon className="h-5 w-5" />
                </Link>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="text-xs font-semibold text-text-muted hover:text-text-primary hidden lg:block px-2 min-h-[44px]"
                >
                  Log out
                </button>
              </>
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
    </div>
  )
}
