import { NavLink } from 'react-router-dom'
import { ArrowRightOnRectangleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { ADMIN_NAV_GROUPS } from '@/shared/layouts/adminNav'
import { AppLogo } from '@/shared/components/AppLogo'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { cn } from '@/shared/utils/cn'

function SidebarBrand({ onCloseMobile }: { onCloseMobile?: () => void }) {
  return (
    <div className="admin-sidebar-brand relative shrink-0 border-b border-border-default/40">
      {onCloseMobile ? (
        <button
          type="button"
          className="absolute right-2 top-2 z-10 rounded-lg p-2 text-text-muted hover:bg-bg-elevated/80 hover:text-text-primary lg:hidden"
          aria-label="Close menu"
          onClick={onCloseMobile}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      ) : null}

      <div className="relative flex flex-col items-center px-5 pb-5 pt-6 text-center">
        <AppLogo size="md" variant="full" className="h-9 w-auto max-w-[172px]" />

        <div className="mt-4 flex w-full items-center gap-2.5">
          <span
            className="h-px flex-1 bg-gradient-to-r from-transparent via-border-default/50 to-border-default/20"
            aria-hidden="true"
          />
          <p className="shrink-0 font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-text-muted">
            Admin Panel
          </p>
          <span
            className="h-px flex-1 bg-gradient-to-l from-transparent via-border-default/50 to-border-default/20"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  )
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto admin-sidebar-scroll px-3" aria-label="Admin navigation">
      {ADMIN_NAV_GROUPS.map((group) => (
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

export function AdminSidebar({
  mobileOpen,
  onCloseMobile,
  displayName,
  email,
  onSignOut,
}: {
  mobileOpen: boolean
  onCloseMobile: () => void
  displayName: string
  email?: string
  onSignOut: () => void
}) {
  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm lg:hidden"
          aria-label="Close navigation"
          onClick={onCloseMobile}
        />
      ) : null}

      <aside
        className={cn(
          'admin-sidebar fixed z-50 flex w-[var(--admin-sidebar-width)] max-w-[88vw] flex-col',
          'border-border-default/80 bg-bg-surface/95 backdrop-blur-xl',
          'safe-area-pt safe-area-pb transition-transform duration-200 ease-out',
          'inset-y-0 left-0 border-r',
          'lg:bottom-[var(--admin-sidebar-inset)] lg:left-[var(--admin-sidebar-inset)] lg:top-[var(--admin-sidebar-inset)] lg:h-auto lg:overflow-hidden lg:rounded-[1.25rem] lg:border lg:border-border-default/80 lg:border-r',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        aria-label="Sidebar"
      >
        <SidebarBrand onCloseMobile={onCloseMobile} />

        <div className="flex min-h-0 flex-1 flex-col py-4">
          <SidebarNav onNavigate={onCloseMobile} />
          <SidebarFooter displayName={displayName} email={email} onSignOut={onSignOut} />
        </div>
      </aside>
    </>
  )
}
