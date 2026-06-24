import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'
import type { Notification } from '@/mocks/data/types'
import { getNotificationMeta } from '@/features/notifications/constants/notificationUi'
import { formatRelativeTime } from '@/shared/utils/formatDate'
import { cn } from '@/shared/utils/cn'

interface NotificationCardProps {
  notification: Notification
  onMarkRead: (id: string) => void
  isMarkingRead?: boolean
}

export function NotificationCard({ notification, onMarkRead, isMarkingRead }: NotificationCardProps) {
  const meta = getNotificationMeta(notification.type)
  const Icon = meta.icon

  const handleOpen = () => {
    if (!notification.read) onMarkRead(notification.id)
  }

  const inner = (
    <>
      <div
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border',
          meta.iconClass,
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              meta.badgeClass,
            )}
          >
            {meta.label}
          </span>
          {!notification.read && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-live/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-live">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-live" aria-hidden="true" />
              New
            </span>
          )}
        </div>

        <p
          className={cn(
            'mt-1.5 font-display text-base font-bold leading-snug',
            notification.read ? 'text-text-primary' : 'text-text-primary',
          )}
        >
          {notification.title}
        </p>
        <p className="mt-1 text-sm text-text-muted leading-relaxed line-clamp-2">{notification.message}</p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <time className="text-xs text-text-muted" dateTime={notification.createdAt}>
            {formatRelativeTime(notification.createdAt)}
          </time>
          {notification.link && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-secondary group-hover:text-accent-primary transition-colors">
              View details
              <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          )}
        </div>
      </div>

      {!notification.read && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onMarkRead(notification.id)
          }}
          disabled={isMarkingRead}
          className={cn(
            'shrink-0 self-start rounded-lg border border-border-default/70 bg-bg-elevated/60 p-2',
            'text-text-muted hover:border-accent-secondary/40 hover:text-accent-secondary transition-colors',
            'disabled:opacity-50',
          )}
          aria-label="Mark as read"
          title="Mark as read"
        >
          <CheckIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </>
  )

  const cardClass = cn(
    'group flex gap-4 rounded-xl border p-4 sm:p-5 transition-all duration-200',
    notification.read
      ? 'border-border-default/60 bg-bg-surface/80 hover:border-border-default'
      : 'border-accent-live/25 bg-accent-live/[0.04] shadow-sm hover:border-accent-live/40 hover:shadow-card',
  )

  if (notification.link) {
    return (
      <Link to={notification.link} onClick={handleOpen} className={cn(cardClass, 'block')}>
        {inner}
      </Link>
    )
  }

  return <article className={cardClass}>{inner}</article>
}
