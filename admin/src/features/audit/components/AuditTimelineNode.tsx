import {
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ShieldExclamationIcon,
  TicketIcon,
  TrophyIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import {
  formatAuditClock,
  getActionCategory,
  getCategoryStyle,
  humanizeAction,
  humanizeEntityType,
  isDestructiveAction,
  truncateEntityId,
  type AdminAuditEntry,
} from '@/features/audit/lib/auditUtils'
import { Badge } from '@/shared/components/Badge'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { cn } from '@/shared/utils/cn'

function categoryIcon(category: ReturnType<typeof getActionCategory>) {
  switch (category) {
    case 'user':
      return UserCircleIcon
    case 'platform':
      return TrophyIcon
    case 'season':
      return CalendarDaysIcon
    case 'moderation':
      return ChatBubbleLeftRightIcon
    default:
      return Cog6ToothIcon
  }
}

export function AuditTimelineNode({
  entry,
  selected,
  onSelect,
  isLast,
}: {
  entry: AdminAuditEntry
  selected: boolean
  onSelect: (entry: AdminAuditEntry) => void
  isLast: boolean
}) {
  const category = getActionCategory(entry.action)
  const style = getCategoryStyle(category)
  const Icon = categoryIcon(category)
  const destructive = isDestructiveAction(entry.action)

  return (
    <div className="audit-timeline-node relative flex gap-4 pl-1">
      <div className="relative flex flex-col items-center">
        <button
          type="button"
          onClick={() => onSelect(entry)}
          className={cn(
            'relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50',
            selected
              ? 'border-cyan-400/50 bg-cyan-400/15 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
              : cn(style.ring, 'hover:scale-105'),
            destructive && !selected && 'border-accent-loss/30',
          )}
          aria-label={`Inspect ${humanizeAction(entry.action)}`}
        >
          <Icon className={cn('h-5 w-5', destructive ? 'text-accent-loss' : style.text)} aria-hidden="true" />
          {destructive ? (
            <span
              className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg-surface bg-accent-loss"
              aria-hidden="true"
            />
          ) : null}
        </button>
        {!isLast ? (
          <div className="audit-timeline-spine mt-2 w-px flex-1 min-h-[1.5rem]" aria-hidden="true" />
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => onSelect(entry)}
        className={cn(
          'audit-timeline-card mb-4 min-w-0 flex-1 rounded-2xl border p-4 text-left transition-all sm:p-4',
          'hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40',
          selected
            ? 'border-cyan-400/35 bg-bg-elevated/80 ring-1 ring-cyan-400/20'
            : 'border-border-default/60 bg-bg-surface/60 hover:border-border-strong hover:bg-bg-elevated/40',
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <time className="font-mono text-[11px] tabular-nums text-text-muted" dateTime={entry.createdAt}>
            {formatAuditClock(entry.createdAt)}
          </time>
          <Badge variant={destructive ? 'loss' : 'default'} className="font-mono normal-case tracking-normal">
            {style.label}
          </Badge>
        </div>

        <p className="mt-2 font-display text-base font-bold leading-snug sm:text-lg">
          {humanizeAction(entry.action)}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-text-muted">
          <span className="inline-flex items-center gap-2">
            <UserAvatar name={entry.admin.displayName} size="sm" className="!h-6 !w-6 !text-[10px]" />
            <span className="font-medium text-text-primary">{entry.admin.displayName}</span>
          </span>
          <span className="hidden h-3 w-px bg-border-default sm:inline-block" aria-hidden="true" />
          <span className="inline-flex items-center gap-1.5 font-mono">
            <TicketIcon className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
            {humanizeEntityType(entry.entityType)}
            {entry.entityId ? ` · ${truncateEntityId(entry.entityId)}` : ''}
          </span>
        </div>

        {destructive ? (
          <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-accent-loss">
            <ShieldExclamationIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Critical action
          </p>
        ) : null}
      </button>
    </div>
  )
}
