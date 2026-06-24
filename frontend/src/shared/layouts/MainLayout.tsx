import { Link, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  HomeIcon,
  TrophyIcon,
  WalletIcon,
  BellIcon,
  ChartBarIcon,
  Bars3Icon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'
import { ROUTES } from '@/core/constants/routes'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { Button } from '@/shared/components/ui/Button'
import { SideDrawer } from '@/shared/components/ui/SideDrawer'
import { SportsNavSidebar } from '@/features/fixtures/components/SportsNavSidebar'
import { SportsNavDrawerProvider } from '@/features/fixtures/context/SportsNavDrawerContext'
import { EditProfileDrawerProvider } from '@/features/profile/context/EditProfileDrawerContext'
import { EditProfileDrawer } from '@/features/profile/components/EditProfileDrawer'
import { BetSlipChatPanel } from '@/features/betting/components/BetSlipChatPanel'
import { ProfileSidebarPanel } from '@/features/profile/components/ProfileSidebarPanel'
import { AccountMenuDrawer } from '@/features/profile/components/AccountMenuDrawer'
import { MobileBottomNav, MobileMoreMenu } from '@/shared/layouts/MobileNav'
import { AppLogo } from '@/shared/components/AppLogo'
import { ProfileAvatar } from '@/features/profile/components/ProfileAvatar'
import { SiteFooter } from '@/shared/components/SiteFooter'
import { prefetchActiveSeason } from '@/features/seasons/hooks/useSeasons'
import { prefetchSportsNews } from '@/features/news/hooks/useSportsNews'

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
    to: ROUTES.FORUM,
    label: 'Forum',
    icon: ChatBubbleLeftRightIcon,
    match: (pathname: string) => pathname.startsWith('/forum'),
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
        'flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary',
        className,
      )}
    >
      {children}
    </Link>
  )
}

export function MainLayout() {
  const location = useLocation()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [moreOpen, setMoreOpen] = useState(false)
  const [sportsNavOpen, setSportsNavOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const pathname = location.pathname
  const search = location.search

  useEffect(() => {
    if (pathname === ROUTES.HOME) {
      prefetchActiveSeason(queryClient)
      prefetchSportsNews(queryClient, { sport: 'soccer', limit: 10 })
    }
  }, [pathname, queryClient])

  return (
    <EditProfileDrawerProvider>
    <SportsNavDrawerProvider
      open={() => setSportsNavOpen(true)}
      close={() => setSportsNavOpen(false)}
    >
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-40 border-b border-border-default/70 bg-bg-surface/95 backdrop-blur-md safe-area-pt">
          <div className="max-w-[1800px] mx-auto flex items-center gap-3 sm:gap-4 min-h-14 sm:min-h-[60px] py-2 px-4 lg:px-6">
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

            <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0 ml-auto">
              {user ? (
                <>
                  <HeaderIconLink to={ROUTES.NOTIFICATIONS} label="Notifications">
                    <BellIcon className="h-[18px] w-[18px]" />
                  </HeaderIconLink>
                  <button
                    type="button"
                    onClick={() => setAccountOpen(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-full hover:ring-2 hover:ring-accent-secondary/50 transition-shadow overflow-hidden"
                    aria-label="Open account menu"
                  >
                    <ProfileAvatar
                      name={user.displayName}
                      avatarUrl={user.avatarUrl}
                      className="h-9 w-9 text-xs ring-2 ring-border-default/80"
                    />
                  </button>
                </>
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

        <div className="flex-1 max-w-[1800px] mx-auto w-full px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
            <aside className="hidden xl:block w-[240px] shrink-0">
              <SportsNavSidebar />
            </aside>
            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
            <ProfileSidebarPanel />
          </div>
        </div>

        <SiteFooter variant="full" />

        <BetSlipChatPanel />
        <MobileBottomNav onMoreOpen={() => setMoreOpen(true)} />
        <MobileMoreMenu open={moreOpen} onClose={() => setMoreOpen(false)} />
        <AccountMenuDrawer open={accountOpen} onClose={() => setAccountOpen(false)} />
        <EditProfileDrawer />

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
    </EditProfileDrawerProvider>
  )
}
