import { Bars3Icon } from '@heroicons/react/24/outline'
import { AppLogo } from '@/shared/components/AppLogo'

/** Mobile-only top bar for opening the navigation drawer. */
export function AdminMobileBar({
  pageTitle,
  onOpenMobileNav,
}: {
  pageTitle: string
  onOpenMobileNav: () => void
}) {
  return (
    <header className="sticky top-0 z-30 safe-area-pt lg:hidden">
      <div className="border-b border-border-default/60 bg-bg-surface/92 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-default/70 bg-bg-elevated/50 text-text-muted transition-colors hover:border-accent-secondary/30 hover:bg-accent-secondary/10 hover:text-text-primary"
            aria-label="Open menu"
            onClick={onOpenMobileNav}
          >
            <Bars3Icon className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base font-semibold tracking-tight text-text-primary">
              {pageTitle}
            </p>
          </div>

          <span aria-hidden="true">
            <AppLogo size="sm" variant="mark" className="h-8 w-8 shrink-0 opacity-90" />
          </span>
        </div>
      </div>
    </header>
  )
}
