import { Link } from 'react-router-dom'
import { LiveBadge } from '@/shared/components/LiveBadge'
import { formatMatchDate, formatMatchTime } from '@/shared/utils/formatDate'
import { matchPath } from '@/core/constants/routes'
import type { MatchWithTeams } from '@/features/fixtures/hooks/useFixtures'

export function MatchRow({ match }: { match: MatchWithTeams }) {
  const score =
    match.status === 'live' || match.status === 'finished'
      ? `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`
      : formatMatchTime(match.startTime)

  return (
    <Link
      to={matchPath(match.id)}
      className="flex items-center gap-3 p-4 rounded-xl border border-border-default bg-bg-surface hover:bg-bg-elevated transition-colors min-h-[72px]"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-text-muted">{match.league.name}</span>
          <LiveBadge status={match.status} minute={match.minute} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="font-medium truncate">{match.homeTeam.name}</p>
            <p className="font-medium truncate mt-1">{match.awayTeam.name}</p>
          </div>
          <div className="text-right font-mono font-bold text-lg">
            {match.status === 'scheduled' ? (
              <div className="text-sm">
                <p>{formatMatchDate(match.startTime)}</p>
                <p className="text-text-muted">{score}</p>
              </div>
            ) : (
              <p>{score}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
