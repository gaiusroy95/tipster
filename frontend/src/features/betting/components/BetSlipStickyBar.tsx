import { Link } from 'react-router-dom'
import { ROUTES } from '@/core/constants/routes'
import { BetSlipIcon } from '@/features/betting/components/BetSlipIcon'
import { useBetSlipStore, resolveSelectionStake } from '@/features/betting/stores/betSlipStore'
import { calcBetReturn } from '@/features/betting/lib/betSlipUtils'
import { formatCredits } from '@/shared/utils/formatCredits'
import { cn } from '@/shared/utils/cn'

export function BetSlipStickyBar() {
  const selections = useBetSlipStore((s) => s.selections)

  if (selections.length === 0) return null

  const totalStake = selections.reduce(
    (sum, sel) => sum + resolveSelectionStake(sel),
    0,
  )
  const totalReturn = selections.reduce(
    (sum, sel) =>
      sum + calcBetReturn(resolveSelectionStake(sel), sel.odds, sel.marketType),
    0,
  )
  const first = selections[0]

  return (
    <div
      className={cn(
        'xl:hidden fixed inset-x-0 z-30 border-t border-border-default/60 bg-bg-surface/95 backdrop-blur-md safe-area-pb',
        'bottom-nav-offset',
      )}
      role="region"
      aria-label="Bet slip summary"
    >
      <Link
        to={ROUTES.BET_SLIP}
        className="mx-auto flex min-h-[52px] max-w-[1600px] items-center gap-3 px-4 py-3"
      >
        <BetSlipIcon size="sm" className="shrink-0 text-accent-secondary" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold tracking-tight">
            {selections.length === 1
              ? `${first.homeTeam} v ${first.awayTeam}`
              : `${selections.length} selections`}
          </p>
          <p className="truncate text-xs text-text-muted">
            {selections.length === 1 ? first.selectionLabel : 'Tap to review slip'}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
            Stake
          </p>
          <p className="font-mono text-sm font-semibold tabular-nums text-text-primary">
            {formatCredits(totalStake)}
          </p>
          <p className="font-mono text-xs font-semibold tabular-nums text-accent-primary">
            → {formatCredits(totalReturn)}
          </p>
        </div>
      </Link>
    </div>
  )
}
