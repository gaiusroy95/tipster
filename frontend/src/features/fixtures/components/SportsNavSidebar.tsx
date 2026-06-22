import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useLeagues } from '@/features/fixtures/hooks/useFixtures'
import { useLeaderboard } from '@/features/leaderboard/hooks/useLeaderboard'
import {
  fixtureViewToStatus,
  useFixtureNavParams,
} from '@/features/fixtures/hooks/useFixtureNavParams'
import { useFixtures } from '@/features/fixtures/hooks/useFixtures'
import { ROUTES } from '@/core/constants/routes'
import { formatCredits } from '@/shared/utils/formatCredits'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { LeaderboardCompactRow } from '@/shared/components/LeaderboardCompactRow'
import {
  FIXTURE_VIEWS,
  SPORT_CATEGORIES,
  type FixtureView,
} from '@/core/constants/sports'
import { cn } from '@/shared/utils/cn'
import { SportCategoryIcon } from '@/features/fixtures/components/SportCategoryIcon'
import { FixtureViewIcon } from '@/features/fixtures/components/FixtureViewIcon'

const VIEW_ITEMS: { id: FixtureView; label: string }[] = [
  { id: FIXTURE_VIEWS.LIVE, label: 'Live' },
  { id: FIXTURE_VIEWS.UPCOMING, label: 'Upcoming' },
  { id: FIXTURE_VIEWS.FINISHED, label: 'Finished' },
]

function NavItem({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean
  onClick?: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors min-h-[44px]',
        active
          ? 'bg-bg-elevated text-text-primary font-medium'
          : 'text-text-muted hover:bg-bg-elevated/50 hover:text-text-primary',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function SportsNavSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { view, sportId, leagueId, setView, setSportId, setLeagueId } = useFixtureNavParams()
  const leagues = useLeagues(sportId)
  const leaderboard = useLeaderboard(undefined, 'points')

  const status = fixtureViewToStatus(view)
  const fixtures = useFixtures({ sportId, status, leagueId })

  const handleView = (id: FixtureView) => {
    setView(id)
    onNavigate?.()
  }

  const handleSport = (id: string) => {
    setSportId(id)
    onNavigate?.()
  }

  const handleLeague = (id: string | undefined) => {
    setLeagueId(id)
    onNavigate?.()
  }

  return (
    <div className="flex flex-col h-full">
      <nav className="sidebar-panel flex-1" aria-label="Sports navigation">
        <div className="border-b border-border-default">
          {VIEW_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              active={view === item.id}
              onClick={() => handleView(item.id)}
            >
              <FixtureViewIcon view={item.id} />
              <span>{item.label}</span>
            </NavItem>
          ))}
        </div>

        <div className="py-2">
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Sports
          </p>
          {SPORT_CATEGORIES.map((sport) => {
            const active = sportId === sport.id
            const count = active ? (fixtures.data?.length ?? 0) : undefined

            return (
              <NavItem
                key={sport.id}
                active={active}
                onClick={() => handleSport(sport.id)}
              >
                <SportCategoryIcon sportId={sport.id} className="h-4 w-4 shrink-0 opacity-80" />
                <span className="flex-1 truncate">{sport.name}</span>
                {active && count !== undefined && (
                  <span className="text-xs font-mono text-text-muted">{count}</span>
                )}
              </NavItem>
            )
          })}
        </div>

        {leagues.data && leagues.data.length > 0 && (
          <div className="border-t border-border-default py-2">
            <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Leagues
            </p>
            <NavItem active={!leagueId} onClick={() => handleLeague(undefined)}>
              <span className="flex-1">All leagues</span>
            </NavItem>
            {leagues.data.map((league) => (
              <NavItem
                key={league.id}
                active={leagueId === league.id}
                onClick={() => handleLeague(league.id)}
              >
                <span className="flex-1 truncate text-sm">{league.name}</span>
                <span className="text-xs text-text-muted truncate max-w-[72px]">{league.country}</span>
              </NavItem>
            ))}
          </div>
        )}
      </nav>

      <div className="mt-6 space-y-4 border-t border-border-default pt-4">
        <section className="px-1">
          <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              League tipsters
            </h3>
            <Link
              to={ROUTES.LEADERBOARD}
              onClick={() => onNavigate?.()}
              className="text-xs text-text-muted hover:text-text-primary"
            >
              See all
            </Link>
          </div>
          {leaderboard.isLoading ? (
            <div className="space-y-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 mx-2" />
              ))}
            </div>
          ) : (
            <ul className="space-y-0.5">
              {leaderboard.data?.slice(0, 4).map((entry) => (
                <li key={entry.userId}>
                  <LeaderboardCompactRow
                    rank={entry.rank}
                    displayName={entry.displayName}
                    userId={entry.userId}
                    trailing={`+${formatCredits(entry.profitLoss)}`}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="px-1">
          <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Top 100</h3>
            <Link
              to={ROUTES.LEADERBOARD}
              onClick={() => onNavigate?.()}
              className="text-xs text-text-muted hover:text-text-primary"
            >
              Full board
            </Link>
          </div>
          <ul className="space-y-0.5">
            {leaderboard.data?.slice(0, 3).map((entry) => (
              <li key={`top-${entry.userId}`}>
                <LeaderboardCompactRow
                  rank={entry.rank}
                  displayName={entry.username}
                  userId={entry.userId}
                  trailing={`${entry.points} pts`}
                  trailingClassName="text-accent-win"
                />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
