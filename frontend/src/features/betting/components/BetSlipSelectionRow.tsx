import { XMarkIcon } from '@heroicons/react/24/outline'
import { BetSlipStakePicker } from '@/features/betting/components/BetSlipStakePicker'
import {
  betSlipMarketLabel,
  formatBetSlipOdds,
} from '@/features/betting/lib/betSlipUtils'
import { formatCredits } from '@/shared/utils/formatCredits'
import type { BetSelection } from '@/features/betting/stores/betSlipStore'
import { cn } from '@/shared/utils/cn'

interface BetSlipSelectionRowProps {
  selection: BetSelection
  stake: number
  potentialWin: number
  onStakeChange: (stake: number) => void
  onRemove: () => void
  className?: string
}

export function BetSlipSelectionRow({
  selection,
  stake,
  potentialWin,
  onStakeChange,
  onRemove,
  className,
}: BetSlipSelectionRowProps) {
  return (
    <article
      className={cn(
        'rounded-xl bg-bg-elevated/15 px-4 py-4 shadow-card ring-1 ring-border-default/60',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-[13px] font-semibold leading-snug tracking-tight text-text-primary">
              {selection.homeTeam}
              <span className="mx-1.5 font-normal text-text-muted/70">v</span>
              {selection.awayTeam}
            </h4>
            <button
              type="button"
              onClick={onRemove}
              className={cn(
                'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
                'text-text-muted/50 transition-colors',
                'hover:bg-bg-elevated hover:text-text-muted',
              )}
              aria-label={`Remove ${selection.homeTeam} v ${selection.awayTeam}`}
            >
              <XMarkIcon className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>

          <p className="text-xs leading-relaxed text-text-muted">
            <span className="font-medium text-text-primary/90">{selection.selectionLabel}</span>
            <span className="mx-1.5 text-border-default">·</span>
            {betSlipMarketLabel(selection.marketType)}
            <span className="mx-1.5 text-border-default">·</span>
            <span className="font-mono tabular-nums text-text-primary/80">
              {formatBetSlipOdds(selection)}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-3.5 flex items-center gap-3">
        <span className="w-10 shrink-0 text-[11px] font-medium text-text-muted">Stake</span>
        <BetSlipStakePicker stake={stake} onChange={onStakeChange} />
        <div className="ml-auto shrink-0 text-right">
          <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted/80">
            Potential win
          </p>
          <p className="font-mono text-xs font-semibold tabular-nums text-accent-primary">
            {formatCredits(potentialWin)}
          </p>
        </div>
      </div>
    </article>
  )
}
