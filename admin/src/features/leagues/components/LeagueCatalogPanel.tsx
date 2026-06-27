import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { EnableToggle } from '@/features/leagues/components/EnableToggle'
import { SportBadge } from '@/features/leagues/components/SportBadge'
import {
  LEAGUE_SORT_OPTIONS,
  type CuratedLeague,
  type LeagueFilter,
  type LeagueSort,
  type LeagueSportFilter,
} from '@/features/leagues/lib/leagueUtils'
import { Badge } from '@/shared/components/Badge'
import { LeagueLogo } from '@/shared/components/LeagueLogo'
import { PanelCard } from '@/shared/components/PanelCard'
import { Input } from '@/shared/components/ui/Input'
import { Skeleton } from '@/shared/components/ui/Card'
import { cn } from '@/shared/utils/cn'

const FILTERS: { id: LeagueFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'enabled', label: 'Enabled' },
  { id: 'disabled', label: 'Disabled' },
]

export function LeagueCatalogPanel({
  leagues,
  rankMap,
  matchCount,
  totalCount,
  isLoading,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  sportOptions,
  sportFilter,
  onSportFilterChange,
  sort,
  onSortChange,
  togglingId,
  onToggle,
}: {
  leagues: CuratedLeague[]
  rankMap: Map<string, number>
  matchCount: number
  totalCount: number
  isLoading: boolean
  search: string
  onSearchChange: (value: string) => void
  filter: LeagueFilter
  onFilterChange: (filter: LeagueFilter) => void
  sportOptions: { id: string; name: string }[]
  sportFilter: LeagueSportFilter
  onSportFilterChange: (sport: LeagueSportFilter) => void
  sort: LeagueSort
  onSortChange: (sort: LeagueSort) => void
  togglingId: string | null
  onToggle: (league: CuratedLeague, isEnabled: boolean) => void
}) {
  return (
    <PanelCard
      title="League catalog"
      subtitle={`${matchCount} of ${totalCount} active league${totalCount === 1 ? '' : 's'} · open or live Overtime markets only`}
      className="overflow-hidden"
      bodyClassName="p-0 sm:p-0"
    >
      <div className="space-y-3 border-b border-border-default/60 px-4 py-4 sm:px-5">
        <div className="relative">
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <Input
            placeholder="Search league, country, sport, or Overtime ID…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
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

          {sportOptions.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                Sport type
              </p>
              <div
                className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                role="tablist"
                aria-label="Filter by sport type"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={sportFilter === 'all'}
                  onClick={() => onSportFilterChange('all')}
                  className={cn(
                    'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                    sportFilter === 'all'
                      ? 'border-accent-secondary/40 bg-accent-secondary/15 text-text-primary'
                      : 'border-border-default bg-bg-elevated/50 text-text-muted hover:border-border-strong hover:text-text-primary',
                  )}
                >
                  All sports
                </button>
                {sportOptions.map((sport) => (
                  <button
                    key={sport.id}
                    type="button"
                    role="tab"
                    aria-selected={sportFilter === sport.id}
                    onClick={() => onSportFilterChange(sport.id)}
                    className={cn(
                      'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                      sportFilter === sport.id
                        ? 'border-accent-secondary/40 bg-accent-secondary/15 text-text-primary'
                        : 'border-border-default bg-bg-elevated/50 text-text-muted hover:border-border-strong hover:text-text-primary',
                    )}
                  >
                    {sport.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="relative w-full sm:w-auto sm:min-w-[180px]">
              <label htmlFor="league-sort" className="sr-only">
                Sort leagues
              </label>
              <select
                id="league-sort"
                value={sort}
                onChange={(e) => onSortChange(e.target.value as LeagueSort)}
                className={cn(
                  'h-9 w-full appearance-none rounded-full border border-border-default bg-bg-elevated/50',
                  'pl-3 pr-9 text-xs font-semibold text-text-primary transition-colors',
                  'hover:border-border-strong focus:border-accent-secondary focus:outline-none focus:ring-1 focus:ring-accent-secondary/30',
                )}
              >
                {LEAGUE_SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id} className="bg-bg-surface text-text-primary">
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2 p-4 sm:p-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : leagues.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border-default bg-bg-elevated/50">
            <LeagueLogo name="League" size="md" />
          </div>
          <p className="mt-4 font-display text-base font-semibold">No leagues found</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-muted">
            {totalCount === 0
              ? 'No leagues currently have open or live markets on Overtime. Sync to refresh the catalog, or check back when fixtures are available.'
              : 'Try a different search, filter, or sort option.'}
          </p>
        </div>
      ) : (
        <>
          <div className="hidden border-b border-border-default/60 bg-bg-elevated/20 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted lg:grid lg:grid-cols-[3.5rem_1fr_6.5rem_7rem_5rem_6rem_5.5rem] lg:gap-4">
            <span>Rank</span>
            <span>League</span>
            <span>Sport</span>
            <span>Overtime ID</span>
            <span>Markets</span>
            <span>Status</span>
            <span className="text-right">Enabled</span>
          </div>

          <ul className="divide-y divide-border-default/50">
            {leagues.map((league) => {
              const rank = rankMap.get(league.id)

              return (
                <li
                  key={league.id}
                  className={cn(
                    'group transition-colors hover:bg-bg-elevated/20',
                    league.isEnabled && 'bg-accent-win/[0.02]',
                  )}
                >
                  <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 lg:grid lg:grid-cols-[3.5rem_1fr_6.5rem_7rem_5rem_6rem_5.5rem] lg:items-center lg:gap-4">
                    <div className="flex items-center gap-3 lg:block">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted lg:hidden">
                        Rank
                      </span>
                      <span
                        className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border border-border-default/70 bg-bg-primary/40 font-mono text-sm font-bold tabular-nums text-text-primary"
                        title="Sidebar priority — #1 appears first in the arena"
                      >
                        {rank ?? '—'}
                      </span>
                    </div>

                    <div className="flex min-w-0 items-start gap-3">
                      <LeagueLogo name={league.name} country={league.country} size="md" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{league.name}</p>
                        <p className="mt-0.5 truncate text-xs text-text-muted">{league.country}</p>
                        <div className="mt-2 lg:hidden">
                          <SportBadge sportId={league.sportId} />
                        </div>
                      </div>
                    </div>

                    <div className="hidden lg:block">
                      <SportBadge sportId={league.sportId} />
                    </div>

                    <div className="flex items-center gap-3 lg:block">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted lg:hidden">
                        Overtime ID
                      </span>
                      <span className="inline-flex rounded-md border border-border-default/70 bg-bg-primary/40 px-2 py-1 font-mono text-xs tabular-nums text-text-muted">
                        {league.overtimeLeagueId}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 lg:block">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted lg:hidden">
                        Markets
                      </span>
                      <span className="inline-flex rounded-md border border-border-default/70 bg-bg-primary/40 px-2 py-1 font-mono text-xs tabular-nums text-text-primary">
                        {league.matchCount}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 lg:block">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted lg:hidden">
                        Status
                      </span>
                      {league.isEnabled ? (
                        <Badge variant="win">Live</Badge>
                      ) : (
                        <Badge>Hidden</Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 lg:justify-end">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted lg:hidden">
                        Enabled
                      </span>
                      <EnableToggle
                        enabled={league.isEnabled}
                        disabled={togglingId === league.id}
                        label={`Toggle ${league.name}`}
                        onChange={(next) => onToggle(league, next)}
                      />
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </PanelCard>
  )
}
