import { useState } from 'react'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  NoSymbolIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import {
  formatOdds,
  formatPlacedTime,
  formatStake,
  getBetStatusStyle,
  matchLabel,
  type AdminBet,
} from '@/features/bets/lib/betUtils'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/utils/cn'

export function BetSlipCard({
  bet,
  onVoid,
  isVoiding,
}: {
  bet: AdminBet
  onVoid?: (bet: AdminBet) => void
  isVoiding?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const style = getBetStatusStyle(bet.status)
  const canVoid = bet.status === 'active' && onVoid

  return (
    <article
      className={cn(
        'bet-slip-card group relative overflow-hidden rounded-2xl border border-border-default/70 bg-bg-surface transition-all hover:border-border-strong',
        style.glow,
      )}
    >
      <div
        className="bet-slip-perforation pointer-events-none absolute inset-x-0 top-0 h-2 opacity-40"
        aria-hidden="true"
      />

      <div className="relative p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={style.badge}>{style.label}</Badge>
              <span className="font-mono text-[11px] font-semibold text-accent-secondary">
                {bet.ticketReference}
              </span>
              {bet.leagueName ? (
                <span className="truncate text-[11px] font-medium uppercase tracking-wider text-text-muted">
                  {bet.leagueName}
                </span>
              ) : null}
              <span className="text-[11px] tabular-nums text-text-muted">{formatPlacedTime(bet.placedAt)}</span>
            </div>

            <div>
              <h3 className="font-display text-lg font-bold leading-tight sm:text-xl">
                {matchLabel(bet)}
              </h3>
              <p className="mt-1.5 text-sm text-text-muted">
                <span className="font-semibold text-text-primary">{bet.selectionLabel}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border-default/70 bg-bg-elevated/50 px-2.5 py-1 text-xs">
                <UserCircleIcon className="h-3.5 w-3.5 text-accent-secondary" aria-hidden="true" />
                <span className="font-semibold">{bet.user.displayName || bet.user.username}</span>
                <span className="text-text-muted">@{bet.user.username}</span>
              </span>
              <span className="rounded-full border border-border-default/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                {bet.marketType}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-end gap-4 sm:flex-col sm:items-end sm:gap-3">
            <div className="rounded-2xl border border-accent-primary/25 bg-gradient-to-br from-accent-primary/15 to-transparent px-4 py-3 text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                Odds
              </p>
              <p className="font-mono text-3xl font-bold tabular-nums text-accent-primary">
                {formatOdds(bet.odds)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-1 sm:gap-2 sm:text-right">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Stake</p>
                <p className="font-display text-lg font-bold tabular-nums">{formatStake(bet.stake)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  Return
                </p>
                <p className="font-display text-lg font-bold tabular-nums text-accent-win">
                  {formatStake(bet.potentialReturn)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-border-default/50 pt-4">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-text-muted transition-colors hover:text-text-primary"
          >
            {expanded ? (
              <>
                <ChevronUpIcon className="h-4 w-4" aria-hidden="true" />
                Hide details
              </>
            ) : (
              <>
                <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
                Slip details
              </>
            )}
          </button>

          {canVoid ? (
            <Button
              variant="danger"
              size="sm"
              isLoading={isVoiding}
              onClick={() => onVoid(bet)}
            >
              <NoSymbolIcon className="h-4 w-4" aria-hidden="true" />
              Void slip
            </Button>
          ) : null}
        </div>

        {expanded ? (
          <dl className="mt-4 grid gap-3 rounded-xl border border-border-default/50 bg-bg-elevated/20 p-4 text-sm sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Ticket reference
              </dt>
              <dd className="mt-1 font-mono text-sm font-semibold text-accent-secondary">
                {bet.ticketReference}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Bet ID</dt>
              <dd className="mt-1 font-mono text-xs text-text-muted">{bet.id}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Match ID</dt>
              <dd className="mt-1 font-mono text-xs text-text-muted">{bet.matchId}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Bet size</dt>
              <dd className="mt-1 capitalize">{bet.betSize}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Tipster email</dt>
              <dd className="mt-1 truncate">{bet.user.email}</dd>
            </div>
            {bet.profitLoss !== null ? (
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  Profit / loss
                </dt>
                <dd
                  className={cn(
                    'mt-1 font-display font-bold tabular-nums',
                    bet.profitLoss >= 0 ? 'text-accent-win' : 'text-accent-loss',
                  )}
                >
                  {bet.profitLoss >= 0 ? '+' : ''}
                  {formatStake(bet.profitLoss)}
                </dd>
              </div>
            ) : null}
            {bet.settledAt ? (
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Settled</dt>
                <dd className="mt-1">{formatPlacedTime(bet.settledAt)}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </div>
    </article>
  )
}
