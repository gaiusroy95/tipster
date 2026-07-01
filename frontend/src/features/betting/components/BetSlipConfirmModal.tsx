import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { getStakeLabel, bettingRules } from '@/core/config/bettingRules'
import { calcPotentialWin } from '@/features/betting/lib/betSlipUtils'
import { formatCredits } from '@/shared/utils/formatCredits'
import type { BetSelection } from '@/features/betting/stores/betSlipStore'
import { resolveSelectionStake } from '@/features/betting/stores/betSlipStore'

interface BetSlipConfirmModalProps {
  open: boolean
  selections: BetSelection[]
  totalStake: number
  totalPotentialWin: number
  isPlacing: boolean
  hasBigBetSelection: boolean
  bigBetsUsed: number
  bigBetsLimit: number
  onClose: () => void
  onConfirm: () => void
}

export function BetSlipConfirmModal({
  open,
  selections,
  totalStake,
  totalPotentialWin,
  isPlacing,
  hasBigBetSelection,
  bigBetsUsed,
  bigBetsLimit,
  onClose,
  onConfirm,
}: BetSlipConfirmModalProps) {
  const title = selections.length === 1 ? 'Confirm bet' : `Confirm ${selections.length} bets`

  return (
    <Modal open={open} onClose={() => !isPlacing && onClose()} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-text-muted">
          Review your selections before placing virtual bets.
        </p>

        {hasBigBetSelection && (
          <div className="rounded-lg border border-accent-gold/30 bg-accent-gold/5 px-3 py-2.5 text-xs text-text-muted">
            You are placing a{' '}
            <strong className="text-accent-gold">{formatCredits(bettingRules.premiumStake)}</strong> big bet.
            Daily big bets: {bigBetsUsed + 1}/{bigBetsLimit} after confirmation
            {bigBetsUsed + 1 > bigBetsLimit ? ' — limit exceeded' : ''}.
          </div>
        )}

        <div className="overflow-hidden rounded-xl ring-1 ring-border-default/60">
          <ul className="divide-y divide-border-default/50">
            {selections.map((sel) => {
              const stake = resolveSelectionStake(sel)
              const potentialWin = calcPotentialWin(stake, sel.odds, sel.marketType)
              return (
                <li key={sel.matchId} className="bg-bg-elevated/20 px-4 py-3">
                  <p className="text-sm font-medium leading-snug">
                    {sel.homeTeam}
                    <span className="mx-1.5 font-normal text-text-muted">v</span>
                    {sel.awayTeam}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">{sel.selectionLabel}</p>
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                    <span className="text-text-muted">
                      {getStakeLabel(stake)} ·{' '}
                      <span className="font-mono tabular-nums text-text-primary">
                        {formatCredits(stake)}
                      </span>
                    </span>
                    <span className="font-mono font-semibold tabular-nums text-accent-primary">
                      {formatCredits(potentialWin)}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="space-y-2 border-t border-border-default/50 bg-bg-surface px-4 py-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Total stake</span>
              <span className="font-mono font-semibold tabular-nums">{formatCredits(totalStake)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Est. win</span>
              <span className="font-mono font-semibold tabular-nums text-accent-primary">
                {formatCredits(totalPotentialWin)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isPlacing}>
            Cancel
          </Button>
          <Button className="flex-1" isLoading={isPlacing} disabled={isPlacing} onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  )
}
