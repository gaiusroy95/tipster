import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import {
  SEASON_FILTER_OPTIONS,
  formatSeasonDates,
  getSeasonProgress,
  getStatusBadge,
  type Season,
  type SeasonFilter,
} from '@/features/seasons/lib/seasonUtils'
import { Badge } from '@/shared/components/Badge'
import { PanelCard } from '@/shared/components/PanelCard'
import { Input } from '@/shared/components/ui/Input'
import { Skeleton } from '@/shared/components/ui/Card'
import { cn } from '@/shared/utils/cn'

export function SeasonListPanel({
  seasons,
  matchCount,
  totalCount,
  isLoading,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  selectedId,
  onSelect,
}: {
  seasons: Season[]
  matchCount: number
  totalCount: number
  isLoading: boolean
  search: string
  onSearchChange: (value: string) => void
  filter: SeasonFilter
  onFilterChange: (filter: SeasonFilter) => void
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <PanelCard
      title="Season timeline"
      subtitle={`${matchCount} of ${totalCount} season${totalCount === 1 ? '' : 's'} match your filters`}
      className="flex h-full flex-col lg:max-h-[calc(100vh-12rem)]"
      bodyClassName="flex min-h-0 flex-1 flex-col p-0 sm:p-0"
    >
      <div className="space-y-3 border-b border-border-default/60 px-4 py-4 sm:px-5">
        <div className="relative">
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <Input
            placeholder="Search season name or description…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {SEASON_FILTER_OPTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onFilterChange(item.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                filter === item.id
                  ? 'border-accent-secondary/40 bg-accent-secondary/15 text-text-primary'
                  : 'border-border-default bg-bg-elevated/50 text-text-muted hover:border-border-strong hover:text-text-primary',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2 p-4 sm:p-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : seasons.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border-default bg-bg-elevated/50">
            <MagnifyingGlassIcon className="h-6 w-6 text-text-muted" aria-hidden="true" />
          </div>
          <p className="mt-4 font-display text-base font-semibold">No seasons found</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-text-muted">
            {totalCount === 0
              ? 'Create your first competition season to start configuring prizes.'
              : 'Try a different search or filter.'}
          </p>
        </div>
      ) : (
        <ul className="min-h-0 flex-1 divide-y divide-border-default/50 overflow-y-auto">
          {seasons.map((season) => {
            const status = getStatusBadge(season)
            const progress = season.isActive
              ? getSeasonProgress(season.startDate, season.endDate)
              : null
            const selected = selectedId === season.id

            return (
              <li key={season.id}>
                <button
                  type="button"
                  onClick={() => onSelect(season.id)}
                  className={cn(
                    'group w-full px-4 py-4 text-left transition-colors sm:px-5',
                    selected
                      ? 'bg-accent-secondary/10'
                      : 'hover:bg-bg-elevated/20',
                    season.isActive && !selected && 'bg-accent-win/[0.03]',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold">{season.name}</p>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-muted">
                        {season.description}
                      </p>
                      <p className="mt-2 text-[11px] text-text-muted">
                        {formatSeasonDates(season.startDate, season.endDate)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-display text-lg font-bold tabular-nums text-accent-primary">
                        {season.prizes.length}
                      </p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                        Prizes
                      </p>
                    </div>
                  </div>

                  {progress !== null ? (
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                        <span>Progress</span>
                        <span className="tabular-nums text-accent-primary">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-border-default/60">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-accent-win to-accent-primary transition-all"
                          style={{ width: `${Math.round(progress)}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </PanelCard>
  )
}
