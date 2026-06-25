import { useEffect, useRef, useState } from 'react'
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { AppLogo } from '@/shared/components/AppLogo'
import { AdminHeaderPageTitle } from '@/shared/layouts/AdminHeaderPageTitle'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { cn } from '@/shared/utils/cn'

function AdminAccountMenu({
  displayName,
  email,
  onSignOut,
  className,
}: {
  displayName: string
  email?: string
  onSignOut: () => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex items-center gap-3 rounded-xl border border-border-default/50 bg-bg-elevated/30 px-2.5 py-1.5 transition-all',
          'hover:border-border-strong hover:bg-bg-elevated/60',
          open && 'border-border-strong bg-bg-elevated/60 shadow-[0_0_24px_rgba(99,102,241,0.08)]',
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <UserAvatar name={displayName} size="sm" />
        <div className="hidden min-w-0 text-left md:block">
          <p className="truncate text-sm font-semibold leading-tight">{displayName}</p>
          <p className="truncate text-[11px] text-text-muted">{email ?? 'Administrator'}</p>
        </div>
        <ChevronDownIcon
          className={cn('h-4 w-4 shrink-0 text-text-muted transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border-default/80 bg-bg-surface/95 shadow-[var(--shadow-elevated)] backdrop-blur-xl"
        >
          <div className="border-b border-border-default/60 bg-bg-elevated/30 px-4 py-4">
            <div className="flex items-center gap-3">
              <UserAvatar name={displayName} size="md" />
              <div className="min-w-0">
                <p className="truncate font-semibold">{displayName}</p>
                <p className="truncate text-xs text-text-muted">{email}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-secondary">
                  Administrator
                </p>
              </div>
            </div>
          </div>
          <div className="p-2">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onSignOut()
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-accent-loss/10 hover:text-accent-loss"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function AdminHeader({
  pageTitle,
  displayName,
  email,
  onSignOut,
  onOpenMobileNav,
}: {
  pageTitle: string
  displayName: string
  email?: string
  onSignOut: () => void
  onOpenMobileNav: () => void
}) {
  return (
    <>
      {/* Mobile — unchanged drawer trigger bar */}
      <header className="admin-header admin-header-mobile sticky top-0 z-30 border-b border-border-default/70 bg-bg-primary/85 backdrop-blur-md safe-area-pt lg:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            className="rounded-lg p-2 text-text-muted hover:bg-bg-elevated hover:text-text-primary"
            aria-label="Open menu"
            onClick={onOpenMobileNav}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-semibold">{pageTitle}</p>
            <p className="truncate text-xs text-text-muted">Tipster Arena · Admin</p>
          </div>
          <AdminAccountMenu displayName={displayName} email={email} onSignOut={onSignOut} />
        </div>
      </header>

      {/* Desktop — full-width app header */}
      <header className="admin-header admin-header-desktop fixed inset-x-0 top-0 z-40 hidden h-[var(--admin-header-height)] border-b border-border-default/60 bg-bg-surface/80 backdrop-blur-xl lg:block">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
          aria-hidden="true"
        />
        <div className="admin-header-grid relative mx-auto grid h-full max-w-[100vw] grid-cols-[var(--admin-sidebar-width)_1fr_auto]">
          <div className="admin-header-brand flex items-center border-r border-border-default/40 px-6">
            <AppLogo size="sm" variant="full" className="h-9 w-auto max-w-[160px]" />
          </div>

          <div className="flex min-w-0 items-center px-8">
            <AdminHeaderPageTitle title={pageTitle} />
          </div>

          <div className="flex items-center border-l border-border-default/40 px-6">
            <AdminAccountMenu
              displayName={displayName}
              email={email}
              onSignOut={onSignOut}
              className="ml-auto"
            />
          </div>
        </div>
      </header>
    </>
  )
}
