import type { ReactNode } from 'react'
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import { AuditTimelineNode } from '@/features/audit/components/AuditTimelineNode'
import {
  groupAuditByDay,
  type AdminAuditEntry,
} from '@/features/audit/lib/auditUtils'
import { Button } from '@/shared/components/ui/Button'
import { Skeleton } from '@/shared/components/ui/Card'
import { cn } from '@/shared/utils/cn'

function TimelineShell({
  children,
  footer,
  recordCount,
}: {
  children: ReactNode
  footer?: ReactNode
  recordCount?: number
}) {
  return (
    <aside
      className={cn(
        'audit-timeline-stream relative flex flex-col overflow-hidden rounded-[1.75rem] border border-border-default/60 bg-bg-surface/70 backdrop-blur-sm',
        'max-h-[min(32rem,calc(100dvh-12rem))] lg:sticky lg:top-6 lg:max-h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-8rem)]',
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-400/8 to-transparent"
        aria-hidden="true"
      />

      <header className="relative shrink-0 border-b border-border-default/50 px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/10">
                <ClipboardDocumentListIcon className="h-4 w-4 text-cyan-300" aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-sm font-semibold tracking-tight text-text-primary">
                  Event timeline
                </p>
                <p className="text-[11px] text-text-muted">Chronological admin activity</p>
              </div>
            </div>
          </div>
          {recordCount !== undefined ? (
            <span className="shrink-0 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums text-cyan-200/90">
              {recordCount} records
            </span>
          ) : null}
        </div>
      </header>

      <div className="audit-timeline-scroll relative min-h-0 flex-1 overflow-y-auto admin-sidebar-scroll px-3 py-4 sm:px-4">
        {children}
        <div
          className="pointer-events-none sticky bottom-0 -mx-3 mt-4 h-6 bg-gradient-to-t from-bg-surface/95 to-transparent sm:-mx-4"
          aria-hidden="true"
        />
      </div>

      {footer ? (
        <footer className="relative shrink-0 border-t border-border-default/50 bg-bg-primary/40 px-4 py-3 sm:px-5">
          {footer}
        </footer>
      ) : null}
    </aside>
  )
}

export function AuditTimelineStream({
  entries,
  selectedId,
  onSelect,
  isLoading,
  hasMore,
  onLoadMore,
  isLoadingMore,
}: {
  entries: AdminAuditEntry[]
  selectedId: string | null
  onSelect: (entry: AdminAuditEntry) => void
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
  isLoadingMore: boolean
}) {
  if (isLoading) {
    return (
      <TimelineShell>
        <div className="space-y-4 pl-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </TimelineShell>
    )
  }

  if (entries.length === 0) {
    return (
      <TimelineShell recordCount={0}>
        <div className="audit-timeline-empty flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-default/70 px-6 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
            <ClipboardDocumentListIcon className="h-7 w-7 text-cyan-300" aria-hidden="true" />
          </div>
          <p className="mt-4 font-display text-lg font-bold">Vault is quiet</p>
          <p className="mt-2 max-w-xs text-sm text-text-muted">
            No audit events match your filters. Admin actions will appear here the moment they occur.
          </p>
        </div>
      </TimelineShell>
    )
  }

  const groups = groupAuditByDay(entries)

  return (
    <TimelineShell
      recordCount={entries.length}
      footer={
        hasMore ? (
          <Button variant="secondary" className="w-full" onClick={onLoadMore} isLoading={isLoadingMore}>
            Load earlier events
          </Button>
        ) : undefined
      }
    >
      <div className="relative space-y-6">
        {groups.map((group) => (
          <section key={group.day} className="relative">
            <div className="sticky top-0 z-10 mb-3 flex items-center gap-2 bg-bg-surface/95 py-1 backdrop-blur-sm">
              <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/25 to-transparent" aria-hidden="true" />
              <h3 className="shrink-0 rounded-full border border-cyan-400/20 bg-bg-primary/90 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200/90 shadow-[0_0_16px_rgba(34,211,238,0.08)]">
                {group.day}
              </h3>
              <div className="h-px flex-1 bg-gradient-to-l from-cyan-400/25 to-transparent" aria-hidden="true" />
            </div>

            <div className="relative">
              <div className="audit-timeline-rail pointer-events-none absolute bottom-3 left-[1.375rem] top-0 w-[2px] -translate-x-1/2 sm:left-[1.5rem]" aria-hidden="true" />

              <div className="space-y-0">
                {group.entries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="audit-timeline-stagger"
                    style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}
                  >
                    <AuditTimelineNode
                      entry={entry}
                      selected={selectedId === entry.id}
                      onSelect={onSelect}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </TimelineShell>
  )
}
