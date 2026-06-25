import type { ComponentType, SVGProps } from 'react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChartBarSquareIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  TrophyIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { BetSlipNavIcon } from '@/shared/components/icons/BetSlipIcon'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { AppLogo } from '@/shared/components/AppLogo'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { ADMIN_TAGLINE } from '@/core/constants/branding'
import { cn } from '@/shared/utils/cn'

type NavItem = {
  to: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  end?: boolean
}

type NavGroup = {
  title: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: ChartBarSquareIcon, end: true }],
  },
  {
    title: 'Platform',
    items: [
      { to: '/users', label: 'Users', icon: UsersIcon },
      { to: '/leagues', label: 'Leagues', icon: TrophyIcon },
      { to: '/seasons', label: 'Seasons', icon: CalendarDaysIcon },
      { to: '/bets', label: 'Bets', icon: BetSlipNavIcon },
    ],
  },
  {
    title: 'Moderation',
    items: [
      { to: '/forum', label: 'Forum', icon: ChatBubbleLeftRightIcon },
      { to: '/audit', label: 'Audit log', icon: ClipboardDocumentListIcon },
    ],
  },
]

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/users': 'Users',
  '/leagues': 'Leagues',
  '/seasons': 'Seasons',
  '/bets': 'Bets',
  '/forum': 'Forum',
  '/audit': 'Audit log',
}

function SidebarBrand() {
  return (
    <div className="relative px-4 py-5">
      <div
        className="pointer-events-none absolute inset-x-4 top-3 h-16 rounded-2xl bg-accent-secondary/10 blur-2xl"
        aria-hidden="true"
      />
      <div className="relative flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border-default/70 bg-bg-elevated/80 shadow-[0_0_24px_rgba(99,102,241,0.12)]">
          <AppLogo size="sm" variant="mark" className="h-7 w-auto max-w-none" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-display font-bold tracking-tight">Admin Panel</p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-text-muted">{ADMIN_TAGLINE}</p>
        </div>
      </div>
    </div>
  )
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto admin-sidebar-scroll px-3">
      {NAV_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted/80">
            {group.title}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-accent-secondary/15 to-transparent font-semibold text-text-primary'
                      : 'text-text-muted hover:bg-bg-elevated/70 hover:text-text-primary',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full transition-opacity',
                        isActive ? 'bg-accent-primary opacity-100' : 'opacity-0',
                      )}
                      aria-hidden="true"
                    />
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
                        isActive
                          ? 'border-accent-secondary/30 bg-accent-secondary/15 text-accent-secondary'
                          : 'border-transparent bg-bg-elevated/40 text-text-muted group-hover:border-border-default group-hover:text-text-primary',
                      )}
                    >
                      <item.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}

function SidebarFooter({
  displayName,
  email,
  onSignOut,
}: {
  displayName: string
  email?: string
  onSignOut: () => void
}) {
  return (
    <div className="border-t border-border-default/70 p-4">
      <div className="mb-3 flex items-center gap-3 rounded-xl border border-border-default/60 bg-bg-elevated/50 p-3">
        <UserAvatar name={displayName} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{displayName}</p>
          <p className="truncate text-xs text-text-muted">{email}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-default bg-bg-surface px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:border-accent-loss/30 hover:bg-accent-loss/10 hover:text-accent-loss"
      >
        <ArrowRightOnRectangleIcon className="h-4 w-4" aria-hidden="true" />
        Sign out
      </button>
    </div>
  )
}

export function AdminLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const currentLabel = ROUTE_LABELS[location.pathname] ?? 'Admin'
  const displayName = user?.displayName ?? 'Admin'

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const closeMobile = () => setMobileOpen(false)
  const handleSignOut = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm lg:hidden"
          aria-label="Close navigation"
          onClick={closeMobile}
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[17.5rem] max-w-[88vw] flex-col border-r border-border-default/80',
          'bg-bg-surface/95 backdrop-blur-xl safe-area-pt safe-area-pb',
          'transition-transform duration-200 ease-out lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex items-start justify-between gap-2 border-b border-border-default/60">
          <SidebarBrand />
          <button
            type="button"
            className="mr-3 mt-5 rounded-lg p-2 text-text-muted hover:bg-bg-elevated hover:text-text-primary lg:hidden"
            aria-label="Close menu"
            onClick={closeMobile}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col py-4">
          <SidebarNav onNavigate={closeMobile} />
          <SidebarFooter
            displayName={displayName}
            email={user?.email}
            onSignOut={handleSignOut}
          />
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-[17.5rem]">
        <header className="sticky top-0 z-30 border-b border-border-default/70 bg-bg-primary/85 backdrop-blur-md safe-area-pt lg:hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              type="button"
              className="rounded-lg p-2 text-text-muted hover:bg-bg-elevated hover:text-text-primary"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-semibold">{currentLabel}</p>
              <p className="truncate text-xs text-text-muted">Tipster Arena · Admin</p>
            </div>
            <UserAvatar name={displayName} size="sm" />
          </div>
        </header>

        <main className="relative flex-1 overflow-auto safe-area-pb">
          <div className="pointer-events-none absolute inset-0 admin-shell-backdrop" aria-hidden="true" />
          <div className="relative p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
