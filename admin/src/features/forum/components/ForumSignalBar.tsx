import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { FORUM_STATUS_FILTERS, type ForumStatusFilter } from '@/features/forum/lib/forumUtils'
import { Input } from '@/shared/components/ui/Input'
import { cn } from '@/shared/utils/cn'

export function ForumSignalBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  total,
}: {
  search: string
  onSearchChange: (value: string) => void
  status: ForumStatusFilter
  onStatusChange: (status: ForumStatusFilter) => void
  total: number
}) {
  return (
    <section className="forum-signal-bar sticky top-0 z-20 rounded-2xl border border-border-default/60 bg-bg-primary/80 p-3 backdrop-blur-xl sm:p-4 lg:static">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search titles and post bodies…"
            className="h-11 pl-10"
            aria-label="Search forum posts"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <FunnelIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              <span className="font-semibold text-text-primary tabular-nums">{total}</span> threads
              in catalog
            </span>
          </div>

          <div
            className="flex gap-1 overflow-x-auto rounded-xl border border-border-default/70 bg-bg-surface/80 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Filter by status"
          >
            {FORUM_STATUS_FILTERS.map((filter) => {
              const active = status === filter.value
              return (
                <button
                  key={filter.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onStatusChange(filter.value)}
                  className={cn(
                    'shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all sm:px-4',
                    active
                      ? 'bg-gradient-to-r from-accent-live/20 to-accent-secondary/20 text-text-primary shadow-[inset_0_0_0_1px_rgba(251,113,133,0.25)]'
                      : 'text-text-muted hover:bg-bg-elevated/80 hover:text-text-primary',
                  )}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
