import { Button } from '@/shared/components/ui/Button'
import { FieldError } from '@/shared/components/ui/Label'
import { bettingRules } from '@/core/config/bettingRules'
import { formatCredits } from '@/shared/utils/formatCredits'
import { cn } from '@/shared/utils/cn'

interface BetSlipSummaryFooterProps {
  totalStake: number
  totalPotentialWin: number
  balance: number
  betsUsed: number
  betsLimit: number
  bigBetsUsed: number
  bigBetsLimit: number
  showBigBetInfo: boolean
  dailyLimitReached: boolean
  tooManySelections: boolean
  stakeError?: string
  placeBetLabel: string
  onPlaceClick: () => void
  disabled: boolean
  className?: string
}

export function BetSlipSummaryFooter({
  totalStake,
  totalPotentialWin,
  balance,
  betsUsed,
  betsLimit,
  bigBetsUsed,
  bigBetsLimit,
  showBigBetInfo,
  dailyLimitReached,
  tooManySelections,
  stakeError,
  placeBetLabel,
  onPlaceClick,
  disabled,
  className,
}: BetSlipSummaryFooterProps) {
  const limitWarning = dailyLimitReached || tooManySelections
  const bigBetsRemaining = Math.max(0, bigBetsLimit - bigBetsUsed)
  const canAffordBigBet = balance >= bettingRules.premiumStake

  return (
    <footer className={cn('space-y-4', className)}>
      <div
        className="h-px w-full bg-gradient-to-r from-transparent via-border-default/70 to-transparent"
        aria-hidden="true"
      />

      {showBigBetInfo && (
        <div className="rounded-lg border border-accent-secondary/25 bg-accent-secondary/5 px-3 py-2.5 text-xs leading-relaxed text-text-muted">
          <p>
            Big bets ({formatCredits(bettingRules.premiumStake)}):{' '}
            <span className="font-semibold text-text-primary">
              {bigBetsRemaining} of {bigBetsLimit} remaining today
            </span>
            {' '}({bigBetsUsed}/{bigBetsLimit} used)
          </p>
          <p className="mt-1">
            Balance:{' '}
            <span className="font-mono font-semibold text-text-primary tabular-nums">
              {formatCredits(balance)}
            </span>
            {!canAffordBigBet && (
              <span className="text-accent-loss"> — insufficient for a big bet</span>
            )}
          </p>
        </div>
      )}

      <div className="space-y-2.5">
        <div className="flex items-baseline justify-between gap-4 text-sm">
          <span className="text-text-muted">Total stake</span>
          <span className="font-mono text-sm font-semibold tabular-nums">{formatCredits(totalStake)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-4 text-sm">
          <span className="text-text-muted">Est. win</span>
          <span className="font-mono text-sm font-semibold tabular-nums text-accent-primary">
            {formatCredits(totalPotentialWin)}
          </span>
        </div>
      </div>

      <FieldError message={stakeError} />

      <p className="text-center text-[11px] leading-relaxed text-text-muted">
        <span className="font-mono tabular-nums text-text-primary/90">{formatCredits(balance)}</span>
        {' '}credits available
        <span className="mx-2 text-border-default">|</span>
        <span className={cn(limitWarning && 'font-medium text-accent-loss')}>
          {betsUsed}/{betsLimit} daily bets used
        </span>
      </p>

      <Button className="w-full" onClick={onPlaceClick} disabled={disabled}>
        {placeBetLabel}
      </Button>
    </footer>
  )
}
