import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import { AuditTimelineNode } from '@/features/audit/components/AuditTimelineNode'
import {
  groupAuditByDay,
  type AdminAuditEntry,
} from '@/features/audit/lib/auditUtils'
import { Button } from '@/shared/components/ui/Button'
import { Skeleton } from '@/shared/components/ui/Card'

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
      <div className="space-y-6 pl-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="audit-timeline-empty flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-default/70 px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
          <ClipboardDocumentListIcon className="h-7 w-7 text-cyan-300" aria-hidden="true" />
        </div>
        <p className="mt-4 font-display text-lg font-bold">Vault is quiet</p>
        <p className="mt-2 max-w-xs text-sm text-text-muted">
          No audit events match your filters. Admin actions will appear here the moment they occur.
        </p>
      </div>
    )
  }

  const groups = groupAuditByDay(entries)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-1">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
          Event timeline
        </p>
        <p className="font-mono text-xs text-text-muted tabular-nums">{entries.length} records</p>
      </div>

      {groups.map((group) => (
        <section key={group.day}>
          <div className="sticky top-16 z-10 mb-4 flex items-center gap-3 lg:top-4">
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/30 to-transparent" aria-hidden="true" />
            <h3 className="shrink-0 rounded-full border border-border-default/70 bg-bg-primary/90 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200/90 backdrop-blur-sm">
              {group.day}
            </h3>
            <div className="h-px flex-1 bg-gradient-to-l from-cyan-400/30 to-transparent" aria-hidden="true" />
          </div>

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
                  isLast={index === group.entries.length - 1}
                />
              </div>
            ))}
          </div>
        </section>
      ))}

      {hasMore ? (
        <Button variant="secondary" className="w-full" onClick={onLoadMore} isLoading={isLoadingMore}>
          Load earlier events
        </Button>
      ) : null}
    </div>
  )
}
