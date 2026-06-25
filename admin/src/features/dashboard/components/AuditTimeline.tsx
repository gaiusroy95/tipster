import { Link } from 'react-router-dom'
import {
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'
import { formatAuditTime, type DashboardStats } from '@/features/dashboard/lib/dashboardUtils'
import { PanelCard } from '@/shared/components/PanelCard'
import { cn } from '@/shared/utils/cn'

function actionTone(action: string) {
  if (action.includes('sync') || action.includes('create')) return 'secondary'
  if (action.includes('ban') || action.includes('delete')) return 'loss'
  if (action.includes('update') || action.includes('verify')) return 'primary'
  return 'default'
}

const toneClasses = {
  default: 'border-border-default bg-bg-elevated text-text-muted',
  secondary: 'border-accent-secondary/30 bg-accent-secondary/10 text-accent-secondary',
  primary: 'border-accent-primary/30 bg-accent-primary/10 text-accent-primary',
  loss: 'border-accent-loss/30 bg-accent-loss/10 text-accent-loss',
}

export function AuditTimeline({ entries }: { entries: DashboardStats['recentAudit'] }) {
  return (
    <PanelCard
      title="Recent audit activity"
      subtitle="A live trail of administrative actions across the platform"
      className="h-full"
      bodyClassName="min-h-[320px]"
      action={
        <Link
          to="/audit"
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-accent-secondary transition-colors hover:bg-accent-secondary/10 hover:text-text-primary"
        >
          View all
          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      }
    >
      {entries.length === 0 ? (
        <div className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-border-default/80 bg-bg-elevated/20 px-6 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border-default bg-bg-surface">
            <ClipboardDocumentListIcon className="h-7 w-7 text-text-muted/70" aria-hidden="true" />
          </div>
          <p className="mt-4 font-display text-base font-semibold">No audit entries yet</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-muted">
            Every admin action is recorded here — league syncs, user updates, moderation decisions, and more.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div
            className="absolute bottom-2 left-[1.125rem] top-2 w-px bg-gradient-to-b from-accent-secondary/50 via-border-default to-transparent"
            aria-hidden="true"
          />
          <ul className="space-y-3">
            {entries.map((entry, index) => {
              const tone = actionTone(entry.action)
              return (
                <li key={entry.id} className="relative pl-11">
                  <span
                    className={cn(
                      'absolute left-3 top-4 z-10 h-3 w-3 rounded-full border-2 border-bg-surface',
                      index === 0 ? 'bg-accent-secondary shadow-[0_0_12px_rgba(99,102,241,0.8)]' : 'bg-border-strong',
                    )}
                    aria-hidden="true"
                  />
                  <article className="rounded-2xl border border-border-default/70 bg-bg-elevated/30 p-4 transition-colors hover:border-border-strong hover:bg-bg-elevated/50">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              'rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                              toneClasses[tone],
                            )}
                          >
                            {entry.action}
                          </span>
                          <span className="rounded-md bg-bg-primary/50 px-2 py-0.5 text-[11px] font-mono text-text-muted">
                            {entry.entityType}
                          </span>
                        </div>
                        <p className="text-sm text-text-muted">
                          by{' '}
                          <span className="font-medium text-text-primary">{entry.admin.displayName}</span>
                        </p>
                      </div>
                      <time
                        className="shrink-0 rounded-lg border border-border-default/60 bg-bg-primary/40 px-2.5 py-1 text-[11px] font-mono text-text-muted"
                        dateTime={entry.createdAt}
                      >
                        {formatAuditTime(entry.createdAt)}
                      </time>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </PanelCard>
  )
}
