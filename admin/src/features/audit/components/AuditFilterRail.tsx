import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { AUDIT_ENTITY_FILTERS, type AuditEntityFilter } from '@/features/audit/lib/auditUtils'
import { Input } from '@/shared/components/ui/Input'
import { cn } from '@/shared/utils/cn'

export function AuditFilterRail({
  search,
  onSearchChange,
  entityType,
  onEntityTypeChange,
  total,
  visible,
}: {
  search: string
  onSearchChange: (value: string) => void
  entityType: AuditEntityFilter
  onEntityTypeChange: (value: AuditEntityFilter) => void
  total: number
  visible: number
}) {
  return (
    <section className="audit-filter-rail rounded-2xl border border-border-default/60 bg-bg-primary/80 p-3 backdrop-blur-xl sm:p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search ticket, @username, action, or admin…"
              className="h-11 pl-10 font-mono text-sm"
              aria-label="Search audit log"
            />
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
            <FunnelIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              <span className="font-semibold text-text-primary tabular-nums">{visible}</span>
              <span className="text-text-muted"> / </span>
              <span className="tabular-nums">{total}</span> events
            </span>
          </div>
        </div>

        <div
          className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Filter by entity domain"
        >
          {AUDIT_ENTITY_FILTERS.map((filter) => {
            const active = entityType === filter.value
            return (
              <button
                key={filter.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onEntityTypeChange(filter.value)}
                className={cn(
                  'shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-all sm:px-3.5',
                  active
                    ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.15)]'
                    : 'border-transparent text-text-muted hover:border-border-default hover:bg-bg-elevated/70 hover:text-text-primary',
                )}
              >
                {filter.label}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
