import { Link } from 'react-router-dom'
import { ProfilePanelCard } from '@/features/profile/components/ProfilePanelCard'
import { ProfileAvatar } from '@/features/profile/components/ProfileAvatar'
import { useLeaderboard } from '@/features/leaderboard/hooks/useLeaderboard'
import { ROUTES, playerPath } from '@/core/constants/routes'
import { RankBadge } from '@/shared/components/RankBadge'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { Button } from '@/shared/components/ui/Button'
import { formatCredits } from '@/shared/utils/formatCredits'
import { cn } from '@/shared/utils/cn'
import type { UserProfileStats } from '@/mocks/data/types'

export function ProfileRankingPanel({ profile }: { profile: UserProfileStats }) {
  const leaderboard = useLeaderboard()

  const entries = leaderboard.data ?? []
  const totalPlayers = entries.length
  const centerIndex = entries.findIndex((e) => e.userId === profile.userId)
  const sliceStart = centerIndex >= 0 ? Math.max(0, centerIndex - 2) : 0
  const nearby = entries.slice(sliceStart, sliceStart + 5)

  return (
    <ProfilePanelCard
      title={`${profile.displayName}'s ranking`}
      subtitle={totalPlayers > 0 ? `Overall leaderboard · ${totalPlayers.toLocaleString()} tipsters` : 'Season standings'}
      bodyClassName="space-y-2"
    >
      {leaderboard.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : nearby.length === 0 ? (
        <p className="text-sm text-text-muted py-6 text-center">Leaderboard data is not available yet.</p>
      ) : (
        <ul className="space-y-1.5" aria-label="Nearby leaderboard ranks">
          {nearby.map((entry) => {
            const isCurrent = entry.userId === profile.userId
            return (
              <li key={entry.userId}>
                <Link
                  to={playerPath(entry.userId)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 min-h-[52px] transition-colors',
                    isCurrent
                      ? 'border-accent-secondary/50 bg-accent-secondary/10 ring-1 ring-accent-secondary/20'
                      : 'border-border-default/60 bg-bg-elevated/30 hover:bg-bg-elevated/60 hover:border-border-default',
                  )}
                >
                  <RankBadge rank={entry.rank} size="sm" />
                  <ProfileAvatar
                    name={entry.displayName}
                    avatarUrl={entry.avatarUrl}
                    className="h-8 w-8 text-[10px] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm font-semibold truncate', isCurrent && 'text-accent-secondary')}>
                      {entry.displayName}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {entry.form.slice(-5).map((f, i) => (
                        <span
                          key={i}
                          className={cn(
                            'h-1.5 w-1.5 rounded-full shrink-0',
                            f === 'W' && 'bg-accent-win',
                            f === 'L' && 'bg-accent-loss',
                            f === 'D' && 'bg-text-muted',
                          )}
                          aria-hidden="true"
                        />
                      ))}
                      <span className="text-[10px] text-text-muted ml-1 truncate">
                        {entry.totalBets} bets · {Math.round(entry.winRate)}% WR
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-xs font-bold text-accent-gold tabular-nums">
                      {formatCredits(entry.profitLoss)}
                    </p>
                    <p className="text-[10px] text-text-muted">season P/L</p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
      <Link to={ROUTES.LEADERBOARD} className="block pt-2">
        <Button variant="secondary" size="sm" className="w-full">View full leaderboard</Button>
      </Link>
    </ProfilePanelCard>
  )
}
