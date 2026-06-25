import { Button } from '@/shared/components/ui/Button'
import { FieldError } from '@/shared/components/ui/Label'
import { formatCredits } from '@/shared/utils/formatCredits'
import { cn } from '@/shared/utils/cn'

interface BetSlipSummaryFooterProps {
  totalStake: number
  totalPotentialReturn: number
  balance: number
  betsUsed: number
  betsLimit: number
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
  totalPotentialReturn,
  balance,
  betsUsed,
  betsLimit,
  dailyLimitReached,
  tooManySelections,
  stakeError,
  placeBetLabel,
  onPlaceClick,
  disabled,
  className,
}: BetSlipSummaryFooterProps) {
  const limitWarning = dailyLimitReached || tooManySelections

  return (
    <footer className={cn('space-y-4', className)}>
      <div
        className="h-px w-full bg-gradient-to-r from-transparent via-border-default/70 to-transparent"
        aria-hidden="true"
      />

      <div className="space-y-2.5">
        <div className="flex items-baseline justify-between gap-4 text-sm">
          <span className="text-text-muted">Total stake</span>
          <span className="font-mono text-sm font-semibold tabular-nums">{formatCredits(totalStake)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-4 text-sm">
          <span className="text-text-muted">Est. return</span>
          <span className="font-mono text-sm font-semibold tabular-nums text-accent-primary">
            {formatCredits(totalPotentialReturn)}
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
