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
  formatAuditEntityRef,
  formatAuditTime,
  getActionCategory,
  getCategoryStyle,
  humanizeAction,
  humanizeEntityType,
  isDestructiveAction,
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
}: {
  entry: AdminAuditEntry
  selected: boolean
  onSelect: (entry: AdminAuditEntry) => void
}) {
  const category = getActionCategory(entry.action)
  const style = getCategoryStyle(category)
  const Icon = categoryIcon(category)
  const destructive = isDestructiveAction(entry.action)
  const entityRef = formatAuditEntityRef(entry)

  return (
    <div className="audit-timeline-node grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-4">
      <div className="flex justify-center pt-1.5">
        <button
          type="button"
          onClick={() => onSelect(entry)}
          className={cn(
            'audit-timeline-node-marker relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all',
            'ring-4 ring-bg-surface/95 focus-visible:outline-none focus-visible:ring-cyan-400/40',
            selected
              ? 'border-cyan-400/60 bg-cyan-400/15 shadow-[0_0_20px_rgba(34,211,238,0.35)]'
              : cn(style.ring, 'hover:scale-105 hover:shadow-[0_0_16px_rgba(34,211,238,0.12)]'),
            destructive && !selected && 'border-accent-loss/40 bg-accent-loss/10',
          )}
          aria-label={`Inspect ${humanizeAction(entry.action)}`}
        >
          <Icon className={cn('h-[18px] w-[18px]', destructive ? 'text-accent-loss' : style.text)} aria-hidden="true" />
          {destructive ? (
            <span
              className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg-surface bg-accent-loss"
              aria-hidden="true"
            />
          ) : null}
        </button>
      </div>

      <button
        type="button"
        onClick={() => onSelect(entry)}
        className={cn(
          'audit-timeline-card mb-3 min-w-0 rounded-2xl border p-4 text-left transition-all sm:p-4',
          'hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40',
          selected
            ? 'border-cyan-400/35 bg-bg-elevated/80 shadow-[0_0_24px_rgba(34,211,238,0.1)] ring-1 ring-cyan-400/20'
            : 'border-border-default/60 bg-bg-surface/60 hover:border-cyan-400/20 hover:bg-bg-elevated/40',
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-0.5">
            <time className="font-mono text-[11px] tabular-nums text-text-muted" dateTime={entry.createdAt}>
              {formatAuditClock(entry.createdAt)}
            </time>
            <p className="font-mono text-[10px] text-text-muted/80">{formatAuditTime(entry.createdAt)}</p>
          </div>
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
          <span className="inline-flex min-w-0 items-center gap-1.5 font-mono">
            <TicketIcon className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden="true" />
            <span className="truncate">
              {humanizeEntityType(entry.entityType)}
              {entityRef !== '—' ? ` · ${entityRef}` : ''}
            </span>
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
