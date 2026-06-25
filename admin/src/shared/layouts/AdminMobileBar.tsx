import { Bars3Icon } from '@heroicons/react/24/outline'

/** Mobile-only top bar for opening the navigation drawer. */
export function AdminMobileBar({
  pageTitle,
  onOpenMobileNav,
}: {
  pageTitle: string
  onOpenMobileNav: () => void
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border-default/70 bg-bg-primary/85 backdrop-blur-md safe-area-pt lg:hidden">
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
      </div>
    </header>
  )
}
