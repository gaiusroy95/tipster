import { useMemo, useState } from 'react'
import { MatchFixtureCard } from '@/features/arena/components/MatchFixtureCard'
import { useFixtures, useLeagues } from '@/features/fixtures/hooks/useFixtures'
import {
  fixtureViewToStatus,
  useFixtureNavParams,
} from '@/features/fixtures/hooks/useFixtureNavParams'
import { MatchesDiscoveryHeader } from '@/features/fixtures/components/MatchesDiscoveryHeader'
import { FixtureViewToggle } from '@/features/fixtures/components/FixtureViewToggle'
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

export type MatchBrowseDiscoveryMode = 'none' | 'inline' | 'sticky'

interface MatchBrowsePanelProps {
  /** Sticky bar with view toggle + sports on matches page; inline toggle on cup tab mobile */
  discoveryMode?: MatchBrowseDiscoveryMode
  className?: string
}

export function MatchBrowsePanel({
  discoveryMode = 'inline',
  className,
}: MatchBrowsePanelProps) {
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

  const controlsProps = {
    search,
    onSearchChange: setSearch,
    sort,
    onSortChange: setSort,
    timeFilter,
    onTimeFilterChange: setTimeFilter,
    showTimeFilter: view === FIXTURE_VIEWS.UPCOMING,
    leagueId,
    onLeagueChange: setLeagueId,
    leagues: leagues.data,
    leaguesLoading: leagues.isLoading,
    resultCount: fixtures.isLoading ? undefined : displayedMatches.length,
    collapsibleOnMobile: true,
  }

  const discoveryBar =
    discoveryMode === 'sticky' ? (
      <MatchesDiscoveryHeader
        matchCount={fixtures.isLoading ? undefined : displayedMatches.length}
        isLoading={fixtures.isLoading}
        className="mb-4 shrink-0"
      />
    ) : null

  return (
    <div className={cn('flex flex-col min-h-0', className)}>
      {discoveryBar}

      {discoveryMode === 'inline' && (
        <div className="mb-4 shrink-0 lg:hidden">
          <FixtureViewToggle />
        </div>
      )}

      {discoveryMode !== 'sticky' && (
        <div className="mb-3 flex shrink-0 items-center justify-between gap-2 lg:flex">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        </div>
      )}

      <MatchListControls className="mb-4 shrink-0" {...controlsProps} />

      <div
        className={cn(
          'arena-match-list scrollbar-panel',
          'rounded-lg border border-border-default/60 bg-bg-surface/40',
          'pr-1 pl-1 py-1',
          'max-lg:pb-bet-slip-safe',
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
