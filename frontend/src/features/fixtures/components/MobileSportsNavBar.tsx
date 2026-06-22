import { useLeagues } from '@/features/fixtures/hooks/useFixtures'
import {
  fixtureViewToStatus,
  useFixtureNavParams,
} from '@/features/fixtures/hooks/useFixtureNavParams'
import { useFixtures } from '@/features/fixtures/hooks/useFixtures'
import {
  FIXTURE_VIEWS,
  SPORT_CATEGORIES,
  type FixtureView,
} from '@/core/constants/sports'
import { SportCategoryIcon } from '@/features/fixtures/components/SportCategoryIcon'
import { FixtureViewIcon } from '@/features/fixtures/components/FixtureViewIcon'
import { cn } from '@/shared/utils/cn'

const VIEW_ITEMS: { id: FixtureView; label: string }[] = [
  { id: FIXTURE_VIEWS.LIVE, label: 'Live' },
  { id: FIXTURE_VIEWS.UPCOMING, label: 'Upcoming' },
  { id: FIXTURE_VIEWS.FINISHED, label: 'Finished' },
]

export function MobileSportsNavBar() {
  const { view, sportId, leagueId, setView, setSportId, setLeagueId } = useFixtureNavParams()
  const leagues = useLeagues(sportId)
  const status = fixtureViewToStatus(view)
  const fixtures = useFixtures({ sportId, status, leagueId })

  return (
    <div className="xl:hidden space-y-3 mb-5">
      <div className="flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {VIEW_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id)}
            className={cn(
              'flex items-center gap-1.5 shrink-0 px-3 py-2 text-sm font-medium min-h-[40px] border-b-2 transition-colors',
              view === item.id
                ? 'border-text-primary text-text-primary'
                : 'border-transparent text-text-muted',
            )}
          >
            <FixtureViewIcon view={item.id} className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SPORT_CATEGORIES.map((sport) => (
          <button
            key={sport.id}
            type="button"
            onClick={() => setSportId(sport.id)}
            className={cn(
              'flex items-center gap-1.5 shrink-0 px-3 py-1.5 text-xs font-medium rounded-md border min-h-[36px] transition-colors',
              sportId === sport.id
                ? 'border-border-strong bg-bg-elevated text-text-primary'
                : 'border-border-default text-text-muted',
            )}
          >
            <SportCategoryIcon sportId={sport.id} className="h-3.5 w-3.5" />
            {sport.name}
          </button>
        ))}
      </div>

      {leagues.data && leagues.data.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setLeagueId(undefined)}
            className={cn(
              'shrink-0 px-3 py-1.5 text-xs font-medium rounded-md border min-h-[32px]',
              !leagueId
                ? 'border-border-strong bg-bg-elevated text-text-primary'
                : 'border-border-default text-text-muted',
            )}
          >
            All
          </button>
          {leagues.data.map((league) => (
            <button
              key={league.id}
              type="button"
              onClick={() => setLeagueId(league.id)}
              className={cn(
                'shrink-0 px-3 py-1.5 text-xs font-medium rounded-md border min-h-[32px]',
                leagueId === league.id
                  ? 'border-border-strong bg-bg-elevated text-text-primary'
                  : 'border-border-default text-text-muted',
              )}
            >
              {league.name}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-text-muted font-mono">
        {fixtures.data?.length ?? 0} matches
      </p>
    </div>
  )
}
