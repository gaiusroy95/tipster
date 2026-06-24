import { MatchFixtureCard } from '@/features/arena/components/MatchFixtureCard'
import { useFixtures } from '@/features/fixtures/hooks/useFixtures'
import {
  fixtureViewToStatus,
  useFixtureNavParams,
} from '@/features/fixtures/hooks/useFixtureNavParams'
import { MobileSportsNavTrigger } from '@/features/fixtures/components/MobileSportsNavTrigger'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { EmptyState } from '@/shared/components/EmptyState'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { FIXTURE_VIEWS } from '@/core/constants/sports'
import { cn } from '@/shared/utils/cn'

const VIEW_TITLES: Record<string, string> = {
  [FIXTURE_VIEWS.LIVE]: 'Live matches',
  [FIXTURE_VIEWS.UPCOMING]: 'Upcoming matches',
  [FIXTURE_VIEWS.FINISHED]: 'Finished matches',
}

export function CupTabPanel() {
  const { view, sportId, leagueId } = useFixtureNavParams()
  const status = fixtureViewToStatus(view)
  const fixtures = useFixtures({ sportId, status, leagueId })

  if (fixtures.isError) {
    return <QueryErrorFallback onRetry={() => fixtures.refetch()} />
  }

  const title = VIEW_TITLES[view] ?? 'Matches'
  const showFeatured = view === FIXTURE_VIEWS.UPCOMING && !leagueId

  return (
    <div className="flex flex-col min-h-0">
      <MobileSportsNavTrigger className="mb-4 shrink-0" />

      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      </div>

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
        ) : fixtures.data?.length === 0 ? (
          <div className="flex min-h-[12rem] items-center justify-center p-4">
            <EmptyState
              title="No matches"
              description="Try another sport or filter, or check back later."
            />
          </div>
        ) : (
          <div className="space-y-3 p-2">
            {fixtures.data?.map((match, index) => (
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
