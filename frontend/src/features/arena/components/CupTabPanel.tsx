import { MatchFixtureCard } from '@/features/arena/components/MatchFixtureCard'
import { useFixtures } from '@/features/fixtures/hooks/useFixtures'
import {
  fixtureViewToStatus,
  useFixtureNavParams,
} from '@/features/fixtures/hooks/useFixtureNavParams'
import { MobileSportsNavBar } from '@/features/fixtures/components/MobileSportsNavBar'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { EmptyState } from '@/shared/components/EmptyState'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { FIXTURE_VIEWS } from '@/core/constants/sports'

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
    <div>
      <MobileSportsNavBar />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      </div>

      {fixtures.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-lg" />
          ))}
        </div>
      ) : fixtures.data?.length === 0 ? (
        <EmptyState
          title="No matches"
          description="Try another sport or filter, or check back later."
        />
      ) : (
        <div className="space-y-3">
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
  )
}
