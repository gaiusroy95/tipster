import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bars3Icon,
  ChartBarSquareIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  TicketIcon,
  TrophyIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { AppLogo } from '@/shared/components/AppLogo'
import { Button } from '@/shared/components/ui/Button'
import { ADMIN_TAGLINE } from '@/core/constants/branding'
import { cn } from '@/shared/utils/cn'

const NAV: Array<{
  to: string
  label: string
  icon: typeof ChartBarSquareIcon
  end?: boolean
}> = [
  { to: '/', label: 'Dashboard', icon: ChartBarSquareIcon, end: true },
  { to: '/users', label: 'Users', icon: UsersIcon },
  { to: '/leagues', label: 'Leagues', icon: TrophyIcon },
  { to: '/seasons', label: 'Seasons', icon: CalendarDaysIcon },
  { to: '/bets', label: 'Bets', icon: TicketIcon },
  { to: '/forum', label: 'Forum', icon: ChatBubbleLeftRightIcon },
  { to: '/audit', label: 'Audit log', icon: ClipboardDocumentListIcon },
]

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 admin-sidebar-scroll overflow-y-auto">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
              isActive
                ? 'bg-accent-secondary/15 font-semibold text-text-primary ring-1 ring-accent-secondary/30'
                : 'text-text-muted hover:bg-bg-elevated/70 hover:text-text-primary',
            )
          }
        >
          <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export function AdminLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

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

  return (
    <div className="min-h-screen bg-bg-primary">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          aria-label="Close navigation"
          onClick={closeMobile}
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-border-default bg-bg-surface/95 backdrop-blur-md safe-area-pt safe-area-pb',
          'transition-transform duration-200 ease-out lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border-default px-4 py-4">
          <div className="min-w-0">
            <AppLogo size="sm" variant="full" />
            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-text-muted">
              {ADMIN_TAGLINE}
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-text-muted hover:bg-bg-elevated hover:text-text-primary lg:hidden"
            aria-label="Close menu"
            onClick={closeMobile}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4">
          <SidebarNav onNavigate={closeMobile} />

          <div className="mt-auto space-y-3 border-t border-border-default pt-4">
            <div className="rounded-xl bg-bg-elevated/60 px-3 py-2.5">
              <p className="truncate text-sm font-medium">{user?.displayName ?? 'Admin'}</p>
              <p className="truncate text-xs text-text-muted">{user?.email}</p>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-72">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border-default bg-bg-primary/90 px-4 py-3 backdrop-blur-md safe-area-pt lg:hidden">
          <button
            type="button"
            className="rounded-lg p-2 text-text-muted hover:bg-bg-elevated hover:text-text-primary"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold font-display">Admin Panel</p>
            <p className="truncate text-xs text-text-muted">Tipster Arena</p>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 safe-area-pb">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
