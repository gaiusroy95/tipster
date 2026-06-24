import { BellIcon, CheckIcon } from '@heroicons/react/24/outline'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/utils/cn'

interface NotificationsPageHeaderProps {
  totalCount: number
  unreadCount: number
  onMarkAllRead: () => void
  isMarkingAll: boolean
}

export function NotificationsPageHeader({
  totalCount,
  unreadCount,
  onMarkAllRead,
  isMarkingAll,
}: NotificationsPageHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-border-default bg-bg-surface shadow-card">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 100% 0%, rgba(251,113,133,0.18) 0%, transparent 55%), radial-gradient(ellipse 55% 45% at 0% 100%, rgba(99,102,241,0.15) 0%, transparent 50%)',
        }}
      />

      <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-live/30 bg-accent-live/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-live">
            <BellIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Activity
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Notifications
            </h1>
            <p className="mt-1.5 max-w-xl text-sm sm:text-base text-text-muted leading-relaxed">
              Bet results, rank changes, season updates, and account alerts — all in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border-default/80 bg-bg-elevated/60 px-3 py-1.5 text-xs text-text-muted">
              <span>
                <strong className="font-semibold text-text-primary">{totalCount}</strong> total
              </span>
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs',
                unreadCount > 0
                  ? 'border-accent-live/30 bg-accent-live/10 text-accent-live'
                  : 'border-border-default/80 bg-bg-elevated/60 text-text-muted',
              )}
            >
              <span className="relative flex h-2 w-2">
                {unreadCount > 0 && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-live opacity-40" />
                )}
                <span
                  className={cn(
                    'relative inline-flex h-2 w-2 rounded-full',
                    unreadCount > 0 ? 'bg-accent-live' : 'bg-border-strong',
                  )}
                />
              </span>
              <span>
                <strong className="font-semibold">{unreadCount}</strong> unread
              </span>
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <Button
            size="lg"
            variant="secondary"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0 || isMarkingAll}
            isLoading={isMarkingAll}
            className="w-full sm:w-auto min-w-[160px]"
          >
            <CheckIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Mark all as read
          </Button>
        </div>
      </div>
    </header>
  )
}
