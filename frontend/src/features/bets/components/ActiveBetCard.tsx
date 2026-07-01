import { Link } from 'react-router-dom'
import { LiveBadge } from '@/shared/components/LiveBadge'
import { Button } from '@/shared/components/ui/Button'
import { formatCredits } from '@/shared/utils/formatCredits'
import { formatMalayOdds } from '@/shared/utils/formatOdds'
import { formatDateTime } from '@/shared/utils/formatDate'
import { calculateCancellationPenalty } from '@/core/config/bettingRules'
import { matchPath } from '@/core/constants/routes'
import type { Bet } from '@/mocks/data/types'
import { cn } from '@/shared/utils/cn'

function marketLabel(marketType: Bet['marketType']) {
  return marketType.replace('_', '/')
}

export function ActiveBetCard({
  bet,
  onCancel,
}: {
  bet: Bet
  onCancel?: () => void
}) {
  const home = bet.homeTeam?.shortName ?? 'Home'
  const away = bet.awayTeam?.shortName ?? 'Away'
  const penalty = calculateCancellationPenalty(bet.stake)
  const refund = bet.stake - penalty
  const isLive = bet.matchStatus === 'live' || bet.match?.status === 'live'
  const isFinished = bet.matchStatus === 'finished' || bet.match?.status === 'finished'
  const canCancel = bet.isCancellable !== false && !isLive && !isFinished

  return (
    <article
      className={cn(
        'rounded-2xl border border-border-default bg-bg-surface overflow-hidden',
        isLive && 'ring-1 ring-accent-live/20',
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-4 border-b border-border-default/50">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {bet.league && (
              <span className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                {bet.league.name}
              </span>
            )}
            {isLive && <LiveBadge status="live" />}
            {isFinished && !isLive && (
              <span className="inline-flex items-center rounded-full bg-bg-elevated px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-text-muted">
                Finished
              </span>
            )}
            {!isLive && !isFinished && (
              <span className="inline-flex items-center rounded-full bg-accent-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-gold">
                Open
              </span>
            )}
          </div>
          <Link to={matchPath(bet.matchId)} className="group inline-block">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight group-hover:text-accent-secondary transition-colors">
              {home} vs {away}
            </h3>
          </Link>
          <p className="text-xs text-text-muted mt-1">
            Placed {formatDateTime(bet.placedAt)}
            <span className="hidden sm:inline"> · </span>
            <Link
              to={matchPath(bet.matchId)}
              className="sm:ml-0 text-accent-secondary hover:underline font-medium"
            >
              View match
            </Link>
          </p>
        </div>
        <div className="flex sm:flex-col sm:items-end gap-1 sm:text-right shrink-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Potential win</p>
          <p className="font-mono text-xl font-bold tabular-nums text-accent-primary">
            {formatCredits(bet.potentialReturn - bet.stake)}
          </p>
          <p className="font-mono text-xs tabular-nums text-text-muted">
            @ {formatMalayOdds(bet.odds)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border-default/50 border-b border-border-default/50 bg-bg-elevated/15">
        <BetStat label="Selection" value={bet.selectionLabel} emphasize className="px-4 py-3.5" />
        <BetStat label="Market" value={marketLabel(bet.marketType)} className="px-4 py-3.5" />
        <BetStat
          label="Stake"
          value={formatCredits(bet.stake)}
          mono
          className="px-4 py-3.5"
        />
      </div>

      {onCancel && canCancel && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-3.5">
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            Cancel penalty{' '}
            <span className="font-mono font-semibold text-accent-loss">{formatCredits(penalty)}</span>
            <span className="mx-1.5 text-text-muted/50">·</span>
            Refund{' '}
            <span className="font-mono font-semibold text-text-primary">{formatCredits(refund)}</span>
          </p>
          <Button variant="danger" size="sm" className="sm:shrink-0 w-full sm:w-auto" onClick={onCancel}>
            Cancel bet
          </Button>
        </div>
      )}
      {onCancel && !canCancel && (
        <div className="px-4 sm:px-5 py-3.5 border-t border-border-default/30">
          <p className="text-xs sm:text-sm text-text-muted">
            Match started or finished — cancellation is no longer available.
          </p>
        </div>
      )}
    </article>
  )
}

function BetStat({
  label,
  value,
  emphasize,
  mono,
  className,
}: {
  label: string
  value: string
  emphasize?: boolean
  mono?: boolean
  className?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">{label}</p>
      <p
        className={cn(
          'mt-1 truncate',
          emphasize && 'font-semibold text-sm sm:text-base',
          mono && 'font-mono font-bold tabular-nums',
          !emphasize && !mono && 'font-medium text-sm',
        )}
      >
        {value}
      </p>
    </div>
  )
}
