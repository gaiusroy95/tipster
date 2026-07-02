import { Link } from 'react-router-dom'
import { Badge } from '@/shared/components/ui/Badge'
import { BetTicketRef } from '@/features/bets/components/BetTicketRef'
import { LiveBadge } from '@/shared/components/LiveBadge'
import { RankBadge, getRankRowClass } from '@/shared/components/RankBadge'
import { formatCredits } from '@/shared/utils/formatCredits'
import { playerPath } from '@/core/constants/routes'
import type { Bet } from '@/mocks/data/types'
import type { BetStatus } from '@/core/constants/markets'
import { cn } from '@/shared/utils/cn'

const statusVariant: Record<BetStatus, 'default' | 'win' | 'loss' | 'muted' | 'live'> = {
  active: 'live',
  won: 'win',
  lost: 'loss',
  cancelled: 'muted',
  void: 'muted',
}

export function BetCard({ bet, showUser }: { bet: Bet; showUser?: boolean }) {
  const home = bet.homeTeam?.shortName ?? 'Home'
  const away = bet.awayTeam?.shortName ?? 'Away'

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          {bet.league && (
            <p className="text-xs text-text-muted">{bet.league.name}</p>
          )}
          <p className="font-semibold mt-0.5">
            {home} vs {away}
          </p>
          {bet.match && (
            <div className="mt-1">
              <LiveBadge status={bet.match.status} minute={bet.match.minute} />
            </div>
          )}
        </div>
        <Badge variant={statusVariant[bet.status]}>{bet.status}</Badge>
      </div>
      <BetTicketRef ticketReference={bet.ticketReference} placedAt={bet.placedAt} />
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-text-muted">Selection</span>
          <p className="font-medium">{bet.selectionLabel}</p>
        </div>
        <div>
          <span className="text-text-muted">Market</span>
          <p className="font-medium capitalize">{bet.marketType.replace('_', '/')}</p>
        </div>
        <div>
          <span className="text-text-muted">Stake</span>
          <p className="font-mono font-medium">{formatCredits(bet.stake)}</p>
        </div>
        <div>
          <span className="text-text-muted">Potential win</span>
          <p className="font-mono font-medium text-accent-primary">
            {formatCredits(bet.potentialReturn - bet.stake)}
          </p>
        </div>
      </div>
      {bet.profitLoss !== undefined && bet.status !== 'active' && (
        <p
          className={cn(
            'text-sm font-mono font-semibold',
            bet.profitLoss >= 0 ? 'text-accent-win' : 'text-accent-loss',
          )}
        >
          P/L: {bet.profitLoss >= 0 ? '+' : ''}{formatCredits(bet.profitLoss)}
        </p>
      )}
      {showUser && (
        <Link to={playerPath(bet.userId)} className="text-sm text-accent-primary hover:underline">
          View profile
        </Link>
      )}
    </div>
  )
}

export function RankingRow({
  rank,
  displayName,
  username,
  userId,
  points,
  roi,
  profitLoss,
  form,
}: {
  rank: number
  displayName: string
  username: string
  userId: string
  points: number
  roi: number
  profitLoss: number
  form: ('W' | 'L' | 'D')[]
}) {
  return (
    <Link
      to={playerPath(userId)}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border transition-colors min-h-[56px]',
        getRankRowClass(rank),
      )}
    >
      <RankBadge rank={rank} size="lg" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{displayName}</p>
        <p className="text-xs text-text-muted">@{username}</p>
        <div className="flex gap-0.5 mt-1 sm:hidden">
          {form.slice(-3).map((f, i) => (
            <span
              key={i}
              className={cn(
                'w-4 h-4 rounded text-[10px] flex items-center justify-center font-bold',
                f === 'W' && 'bg-accent-win/20 text-accent-win',
                f === 'L' && 'bg-accent-loss/20 text-accent-loss',
                f === 'D' && 'bg-bg-elevated text-text-muted',
              )}
            >
              {f}
            </span>
          ))}
        </div>
      </div>
      <div className="hidden sm:flex gap-1">
        {form.map((f, i) => (
          <span
            key={i}
            className={cn(
              'w-5 h-5 rounded text-xs flex items-center justify-center font-bold',
              f === 'W' && 'bg-accent-win/20 text-accent-win',
              f === 'L' && 'bg-accent-loss/20 text-accent-loss',
              f === 'D' && 'bg-bg-elevated text-text-muted',
            )}
          >
            {f}
          </span>
        ))}
      </div>
      <div className="text-right">
        <p className="font-mono font-bold">{points}</p>
        <p className="text-xs text-text-muted">
          {roi.toFixed(1)}% · {profitLoss >= 0 ? '+' : ''}{profitLoss}
        </p>
      </div>
    </Link>
  )
}

export function FormStreak({ form }: { form: ('W' | 'L' | 'D')[] }) {
  return (
    <div className="flex gap-1">
      {form.map((f, i) => (
        <span
          key={i}
          className={cn(
            'w-8 h-8 rounded-lg text-sm flex items-center justify-center font-bold',
            f === 'W' && 'bg-accent-win/20 text-accent-win',
            f === 'L' && 'bg-accent-loss/20 text-accent-loss',
            f === 'D' && 'bg-bg-elevated text-text-muted',
          )}
        >
          {f}
        </span>
      ))}
    </div>
  )
}
