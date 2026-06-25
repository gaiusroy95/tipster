import { Link } from 'react-router-dom'
import { useLeaderboard } from '@/features/leaderboard/hooks/useLeaderboard'
import { ROUTES } from '@/core/constants/routes'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { LeaderboardCompactRow } from '@/shared/components/LeaderboardCompactRow'

export function ArenaMobileHubWidgets() {
  const leaderboard = useLeaderboard(undefined, 'points')
  const topThree = leaderboard.data?.slice(0, 3) ?? []

  return (
    <section className="xl:hidden glass-panel rounded-xl p-4 mb-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-sm font-semibold">Top tipsters</h2>
        <Link to={ROUTES.LEADERBOARD} className="text-xs font-semibold text-accent-secondary">
          Full board →
        </Link>
      </div>
      {leaderboard.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
        </div>
      ) : topThree.length === 0 ? (
        <p className="text-sm text-text-muted">No rankings yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {topThree.map((entry) => (
            <li key={entry.userId}>
              <LeaderboardCompactRow
                rank={entry.rank}
                displayName={entry.displayName}
                userId={entry.userId}
                trailing={`${entry.points} pts`}
                trailingClassName="text-accent-win"
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
