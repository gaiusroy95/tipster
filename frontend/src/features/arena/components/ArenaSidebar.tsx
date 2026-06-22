import { Link } from 'react-router-dom'
import { useLeagues } from '@/features/fixtures/hooks/useFixtures'
import { useLeaderboard } from '@/features/leaderboard/hooks/useLeaderboard'
import { useSeasons } from '@/features/seasons/hooks/useSeasons'
import { ROUTES } from '@/core/constants/routes'
import { formatCredits } from '@/shared/utils/formatCredits'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { LeaderboardCompactRow } from '@/shared/components/LeaderboardCompactRow'
import { ActiveSeasonSidebarCard } from '@/features/arena/components/ActiveSeasonHero'
import { cn } from '@/shared/utils/cn'
import { useState } from 'react'

export function ArenaSidebar() {
  const seasons = useSeasons()
  const leagues = useLeagues()
  const [leagueTab, setLeagueTab] = useState<string | undefined>()
  const leaderboard = useLeaderboard(undefined, 'points')

  const activeSeason = seasons.data?.find((s) => s.isActive)

  return (
    <div className="space-y-5">
      <ActiveSeasonSidebarCard season={activeSeason} isLoading={seasons.isLoading} />

      <section className="glass-panel rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-sm">League tipsters</h3>
          <Link to={ROUTES.LEADERBOARD} className="text-xs text-accent-secondary hover:underline">
            See all
          </Link>
        </div>
        {leagues.data && leagues.data.length > 0 && (
          <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setLeagueTab(undefined)}
              className={cn(
                'px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide shrink-0',
                !leagueTab ? 'bg-accent-secondary text-white' : 'bg-bg-elevated text-text-muted',
              )}
            >
              All
            </button>
            {leagues.data.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLeagueTab(l.id)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide shrink-0',
                  leagueTab === l.id ? 'bg-accent-secondary text-white' : 'bg-bg-elevated text-text-muted',
                )}
              >
                {l.name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
        {leaderboard.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        ) : (
          <ul className="space-y-1.5">
            {leaderboard.data?.slice(0, 5).map((entry) => (
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

      <section className="glass-panel rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-sm">Top 100</h3>
          <Link to={ROUTES.LEADERBOARD} className="text-xs text-accent-secondary hover:underline">
            Full board
          </Link>
        </div>
        <ul className="space-y-1.5">
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
  )
}
