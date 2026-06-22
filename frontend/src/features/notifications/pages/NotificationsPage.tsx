import { Link } from 'react-router-dom'
import { PageShell } from '@/shared/layouts/PageShell'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { EmptyState } from '@/shared/components/EmptyState'
import { Badge } from '@/shared/components/ui/Badge'
import { useNotifications, useMarkNotificationRead } from '@/features/notifications/hooks/useNotifications'
import { formatRelativeTime } from '@/shared/utils/formatDate'
import { cn } from '@/shared/utils/cn'
import { BellIcon } from '@heroicons/react/24/outline'

export function NotificationsPage() {
  const { data, isLoading, isError, refetch } = useNotifications()
  const markRead = useMarkNotificationRead()

  if (isLoading) {
    return (
      <PageShell title="Notifications">
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      </PageShell>
    )
  }

  if (isError) {
    return (
      <PageShell title="Notifications">
        <QueryErrorFallback onRetry={() => refetch()} />
      </PageShell>
    )
  }

  if (!data?.length) {
    return (
      <PageShell title="Notifications">
        <EmptyState title="No notifications" description="You're all caught up." icon={<BellIcon className="h-12 w-12" />} />
      </PageShell>
    )
  }

  return (
    <PageShell title="Notifications">
      <div className="space-y-2">
        {data.map((n) => (
          <div
            key={n.id}
            className={cn(
              'rounded-xl border p-4 transition-colors',
              n.read
                ? 'border-border-default bg-bg-surface'
                : 'border-accent-primary/30 bg-accent-primary/5',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{n.title}</p>
                  {!n.read && <Badge variant="live">New</Badge>}
                </div>
                <p className="text-sm text-text-muted mt-1">{n.message}</p>
                <p className="text-xs text-text-muted mt-2">{formatRelativeTime(n.createdAt)}</p>
              </div>
              {!n.read && (
                <button
                  type="button"
                  onClick={() => markRead.mutate(n.id)}
                  className="text-xs text-accent-primary hover:underline min-h-[44px] px-2"
                >
                  Mark read
                </button>
              )}
            </div>
            {n.link && (
              <Link to={n.link} className="text-sm text-accent-primary hover:underline mt-2 inline-block">
                View details
              </Link>
            )}
          </div>
        ))}
      </div>
    </PageShell>
  )
}
