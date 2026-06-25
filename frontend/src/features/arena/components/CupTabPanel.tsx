import { useMemo, useState } from 'react'
import { MatchFixtureCard } from '@/features/arena/components/MatchFixtureCard'
import { useFixtures, useLeagues } from '@/features/fixtures/hooks/useFixtures'
import {
  fixtureViewToStatus,
  useFixtureNavParams,
} from '@/features/fixtures/hooks/useFixtureNavParams'
import { MobileSportsNavTrigger } from '@/features/fixtures/components/MobileSportsNavTrigger'
import { MatchListControls } from '@/features/fixtures/components/MatchListControls'
import {
  applyMatchListControls,
  type MatchSortId,
  type MatchTimeFilter,
} from '@/features/fixtures/lib/fixtureListUtils'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { EmptyState } from '@/shared/components/EmptyState'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { FIXTURE_VIEWS } from '@/core/constants/sports'
import { cn } from '@/shared/utils/cn'

const VIEW_TITLES: Record<string, string> = {
  [FIXTURE_VIEWS.LIVE]: 'Live matches',
  [FIXTURE_VIEWS.UPCOMING]: 'Upcoming matches',
}

export function CupTabPanel() {
  const { view, sportId, leagueId, setLeagueId } = useFixtureNavParams()
  const status = fixtureViewToStatus(view)
  const fixtures = useFixtures({ sportId, status, leagueId })
  const leagues = useLeagues(sportId)

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<MatchSortId>('kickoff_asc')
  const [timeFilter, setTimeFilter] = useState<MatchTimeFilter>('all')
  const debouncedSearch = useDebounce(search)

  const displayedMatches = useMemo(() => {
    if (!fixtures.data) return []
    return applyMatchListControls(fixtures.data, {
      search: debouncedSearch,
      timeFilter: view === FIXTURE_VIEWS.UPCOMING ? timeFilter : 'all',
      sort,
    })
  }, [fixtures.data, debouncedSearch, timeFilter, sort, view])

  if (fixtures.isError) {
    return <QueryErrorFallback onRetry={() => fixtures.refetch()} />
  }

  const title = VIEW_TITLES[view] ?? 'Matches'
  const showFeatured =
    view === FIXTURE_VIEWS.UPCOMING &&
    !leagueId &&
    !debouncedSearch &&
    timeFilter === 'all' &&
    sort === 'kickoff_asc'

  const hasActiveFilters =
    !!debouncedSearch || !!leagueId || timeFilter !== 'all' || sort !== 'kickoff_asc'

  return (
    <div className="flex flex-col min-h-0">
      <MobileSportsNavTrigger className="mb-4 shrink-0 xl:hidden" />

      <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      </div>

      <MatchListControls
        className="mb-4 shrink-0"
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        showTimeFilter={view === FIXTURE_VIEWS.UPCOMING}
        leagueId={leagueId}
        onLeagueChange={setLeagueId}
        leagues={leagues.data}
        leaguesLoading={leagues.isLoading}
        resultCount={fixtures.isLoading ? undefined : displayedMatches.length}
      />

      <div
        className={cn(
          'arena-match-list-scroll scrollbar-panel',
          'rounded-lg border border-border-default/60 bg-bg-surface/40',
          'pr-1 pl-1 py-1',
        )}
        aria-label={title}
      >
        {fixtures.isLoading ? (
          <div className="space-y-3 p-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full rounded-lg" />
            ))}
          </div>
        ) : displayedMatches.length === 0 ? (
          <div className="flex min-h-[12rem] items-center justify-center p-4">
            <EmptyState
              title="No matches"
              description={
                hasActiveFilters
                  ? 'No matches match your filters. Try clearing search or changing the league.'
                  : 'Try another sport or filter, or check back later.'
              }
            />
          </div>
        ) : (
          <div className="space-y-3 p-2">
            {displayedMatches.map((match, index) => (
              <MatchFixtureCard
                key={match.id}
                match={match}
                featured={showFeatured && index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
