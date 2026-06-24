import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BellIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { EmptyState } from '@/shared/components/EmptyState'
import { Button } from '@/shared/components/ui/Button'
import { NotificationsPageHeader } from '@/features/notifications/components/NotificationsPageHeader'
import { NotificationCard } from '@/features/notifications/components/NotificationCard'
import {
  groupNotificationsByDate,
  type NotificationFilter,
} from '@/features/notifications/constants/notificationUi'
import { useNotifications, useMarkNotificationRead } from '@/features/notifications/hooks/useNotifications'
import { ROUTES } from '@/core/constants/routes'
import { useToast } from '@/shared/components/ui/Toast'
import { cn } from '@/shared/utils/cn'

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  )
}

const filters: { id: NotificationFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
]

export function NotificationsPage() {
  const { toast } = useToast()
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [markingAll, setMarkingAll] = useState(false)
  const { data, isLoading, isError, refetch } = useNotifications()
  const markRead = useMarkNotificationRead()

  const unreadCount = useMemo(() => data?.filter((n) => !n.read).length ?? 0, [data])

  const filtered = useMemo(() => {
    if (!data) return []
    if (filter === 'unread') return data.filter((n) => !n.read)
    return data
  }, [data, filter])

  const groups = useMemo(() => groupNotificationsByDate(filtered), [filtered])

  const handleMarkAllRead = async () => {
    const unread = data?.filter((n) => !n.read) ?? []
    if (unread.length === 0) return
    setMarkingAll(true)
    try {
      await Promise.all(unread.map((n) => markRead.mutateAsync(n.id)))
      toast('All notifications marked as read', 'success')
    } catch {
      toast('Could not mark all as read', 'error')
    } finally {
      setMarkingAll(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-44 rounded-2xl" />
        <FeedSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="pb-8">
        <QueryErrorFallback onRetry={() => refetch()} />
      </div>
    )
  }

  const isEmpty = !data?.length
  const isFilteredEmpty = !isEmpty && filtered.length === 0

  return (
    <div className="space-y-6 pb-8">
      <NotificationsPageHeader
        totalCount={data?.length ?? 0}
        unreadCount={unreadCount}
        onMarkAllRead={() => void handleMarkAllRead()}
        isMarkingAll={markingAll}
      />

      {!isEmpty && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-xl border border-border-default/70 bg-bg-surface p-1">
            {filters.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors min-w-[88px]',
                  filter === id
                    ? 'bg-accent-secondary/15 text-accent-secondary shadow-sm'
                    : 'text-text-muted hover:text-text-primary',
                )}
              >
                {label}
                {id === 'unread' && unreadCount > 0 && (
                  <span className="ml-1.5 tabular-nums opacity-80">({unreadCount})</span>
                )}
              </button>
            ))}
          </div>

          <Link
            to={ROUTES.SETTINGS}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-accent-secondary transition-colors self-start sm:self-auto"
          >
            <Cog6ToothIcon className="h-4 w-4" aria-hidden="true" />
            Notification preferences
          </Link>
        </div>
      )}

      {isEmpty && (
        <div className="rounded-2xl border border-dashed border-border-default/70 bg-bg-surface/50">
          <EmptyState
            title="No notifications yet"
            description="When bets settle, ranks change, or seasons update, you'll see alerts here."
            icon={<BellIcon className="h-12 w-12 opacity-60" />}
          />
        </div>
      )}

      {isFilteredEmpty && (
        <div className="rounded-2xl border border-dashed border-border-default/70 bg-bg-surface/50">
          <EmptyState
            title="You're all caught up"
            description="No unread notifications. Check back after your next bet or season update."
            icon={<BellIcon className="h-12 w-12 opacity-60" />}
            action={{ label: 'Show all', onClick: () => setFilter('all') }}
          />
        </div>
      )}

      {groups.length > 0 && (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                <span className="h-px flex-1 bg-border-default/60" aria-hidden="true" />
                {group.label}
                <span className="h-px flex-1 bg-border-default/60" aria-hidden="true" />
              </h2>
              <div className="space-y-3">
                {group.items.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkRead={(id) => markRead.mutate(id)}
                    isMarkingRead={markRead.isPending}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {!isEmpty && unreadCount > 0 && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void handleMarkAllRead()}
            disabled={markingAll}
            isLoading={markingAll}
          >
            Mark all as read
          </Button>
        </div>
      )}
    </div>
  )
}
