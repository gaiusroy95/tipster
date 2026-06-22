import { Link } from 'react-router-dom'
import { ROUTES } from '@/core/constants/routes'
import { BetSlipIcon } from '@/features/betting/components/BetSlipIcon'
import { useBetSlipStore } from '@/features/betting/stores/betSlipStore'
import { formatCredits } from '@/shared/utils/formatCredits'
import { cn } from '@/shared/utils/cn'

export function BetSlipStickyBar() {
  const selections = useBetSlipStore((s) => s.selections)
  const stake = useBetSlipStore((s) => s.stake)

  if (selections.length === 0) return null

  const selection = selections[0]
  const potential = Math.round(stake * (selection.odds > 0 ? selection.odds : 2))

  return (
    <div
      className={cn(
        'xl:hidden fixed inset-x-0 z-30 border-t border-border-default glass-panel safe-area-pb',
        'bottom-nav-offset',
      )}
      role="region"
      aria-label="Bet slip summary"
    >
      <Link
        to={ROUTES.BET_SLIP}
        className="flex items-center gap-3 px-4 py-3 min-h-[52px] max-w-[1600px] mx-auto"
      >
        <BetSlipIcon size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">
            {selection.homeTeam} vs {selection.awayTeam}
          </p>
          <p className="text-xs text-text-muted truncate">{selection.selectionLabel}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-text-muted">Stake {formatCredits(stake)}</p>
          <p className="text-sm font-mono font-bold text-accent-primary">
            → {formatCredits(potential)}
          </p>
        </div>
      </Link>
    </div>
  )
}
