import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { Label, FieldError } from '@/shared/components/ui/Label'
import { Modal } from '@/shared/components/ui/Modal'
import { BetSlipEmptyIcon } from '@/features/betting/components/BetSlipEmptyIcon'
import { useBetSlipStore } from '@/features/betting/stores/betSlipStore'
import { usePlaceBet } from '@/features/bets/hooks/useBets'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { bettingRules, getBetSize, getStakeLabel, isValidStake } from '@/core/config/bettingRules'
import { formatCredits } from '@/shared/utils/formatCredits'
import { formatMalayOdds, formatDecimalOdds } from '@/shared/utils/formatOdds'
import { ApiError } from '@/core/types/api'
import { useToast } from '@/shared/components/ui/Toast'
import { cn } from '@/shared/utils/cn'
import { ROUTES } from '@/core/constants/routes'
import { FIXTURE_VIEWS } from '@/core/constants/sports'

const BROWSE_MATCHES_PATH = `${ROUTES.HOME}?tab=cup&view=${FIXTURE_VIEWS.UPCOMING}`

function calcReturn(stake: number, odds: number, marketType: string): number {
  if (marketType === 'malay') {
    if (odds > 0) return Math.round(stake + stake * odds)
    return Math.round(stake + stake)
  }
  return Math.round(stake * (odds > 0 ? odds : 2))
}

export function BetSlipPanelContent({ compact = false }: { compact?: boolean }) {
  const selections = useBetSlipStore((s) => s.selections)
  const stake = useBetSlipStore((s) => s.stake)
  const setStake = useBetSlipStore((s) => s.setStake)
  const removeSelection = useBetSlipStore((s) => s.removeSelection)
  const clear = useBetSlipStore((s) => s.clear)
  const setPanelOpen = useBetSlipStore((s) => s.setPanelOpen)
  const balance = useAuthStore((s) => s.user?.balance ?? 0)
  const placeBet = usePlaceBet()
  const { toast } = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [stakeError, setStakeError] = useState<string | undefined>()

  const selection = selections[0]
  const betSize = getBetSize(stake)
  const potentialReturn = selection ? calcReturn(stake, selection.odds, selection.marketType) : 0

  const validateStake = (): boolean => {
    if (!isValidStake(stake)) {
      setStakeError(
        `Choose ${formatCredits(bettingRules.standardStake)} or ${formatCredits(bettingRules.premiumStake)} credits`,
      )
      return false
    }
    if (stake > balance) {
      setStakeError('Insufficient virtual credits')
      return false
    }
    setStakeError(undefined)
    return true
  }

  const handlePlaceBet = async () => {
    if (!selection || !validateStake()) return
    try {
      await placeBet.mutateAsync({
        matchId: selection.matchId,
        marketType: selection.marketType,
        selectionId: selection.selectionId,
        stake,
      })
      clear()
      setConfirmOpen(false)
      setPanelOpen(false)
      toast('Bet placed successfully!', 'success')
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to place bet'
      toast(msg, 'error')
    }
  }

  if (selections.length === 0) {
    const closePanel = () => setPanelOpen(false)

    return (
      <div className={cn(compact ? 'py-8 px-2' : 'py-10', 'text-center')}>
        <div className="flex flex-col items-center">
          <Link
            to={BROWSE_MATCHES_PATH}
            onClick={closePanel}
            className={cn(
              'mb-4 rounded-full transition-transform',
              'hover:scale-105 active:scale-95',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-secondary',
            )}
            aria-label="Browse matches to add a bet"
          >
            <BetSlipEmptyIcon size="lg" />
          </Link>
          <h3 className="text-base font-semibold text-text-primary">Bet slip is empty</h3>
          <p className="mt-2 text-sm text-text-muted max-w-xs leading-relaxed">
            Pick odds on any match to build your slip.
          </p>
          <Link
            to={BROWSE_MATCHES_PATH}
            className="mt-5 text-sm font-semibold text-accent-secondary hover:underline"
            onClick={closePanel}
          >
            Browse matches →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {selections.map((sel) => (
          <div
            key={sel.matchId}
            className="rounded-xl border border-border-default/80 bg-bg-primary/40 p-3"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{sel.homeTeam} vs {sel.awayTeam}</p>
                <p className="text-xs text-text-muted mt-0.5">{sel.selectionLabel}</p>
                <p className="text-[11px] text-text-muted capitalize mt-1">
                  {sel.marketType.replace('_', '/')} ·{' '}
                  {sel.marketType === 'malay'
                    ? formatMalayOdds(sel.odds)
                    : formatDecimalOdds(sel.odds)}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeSelection(sel.matchId)}>
                Remove
              </Button>
            </div>
          </div>
        ))}

        <div className="rounded-xl border border-border-default/80 bg-bg-primary/40 p-3 space-y-3">
          <div>
            <Label>Stake (credits)</Label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {bettingRules.allowedStakes.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    setStake(amount)
                    setStakeError(undefined)
                  }}
                  className={cn(
                    'rounded-xl border px-3 py-3 text-sm font-mono font-bold min-h-[48px] transition-colors',
                    stake === amount
                      ? 'border-accent-secondary bg-accent-secondary/15 text-accent-secondary shadow-glow-accent'
                      : 'border-border-default bg-bg-elevated text-text-muted hover:border-accent-secondary/40 hover:text-text-primary',
                  )}
                >
                  {formatCredits(amount)}
                </button>
              ))}
            </div>
            <FieldError message={stakeError} />
            <p className="text-[11px] text-text-muted mt-2 leading-relaxed">
              Balance {formatCredits(balance)} · Max {bettingRules.dailyBetLimit} bets per day · Stakes are
              {formatCredits(bettingRules.standardStake)} or {formatCredits(bettingRules.premiumStake)} only
            </p>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-text-muted">Bet tier</span>
            <span className="font-medium">{betSize ? getStakeLabel(stake) : '—'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-text-muted">Potential return</span>
            <span className="font-mono font-bold text-accent-primary">
              {formatCredits(potentialReturn)}
            </span>
          </div>

          <Button
            className="w-full"
            onClick={() => {
              if (validateStake()) setConfirmOpen(true)
            }}
            disabled={!selection}
          >
            Place virtual bet
          </Button>
        </div>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm bet">
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            You are placing a <strong className="text-text-primary">{getStakeLabel(stake)}</strong> virtual bet
            for <strong className="text-text-primary font-mono">{formatCredits(stake)}</strong> credits.
          </p>
          <p className="text-sm">
            Selection: <strong>{selection?.selectionLabel}</strong>
          </p>
          <p className="text-sm">
            Potential return:{' '}
            <strong className="text-accent-primary font-mono">{formatCredits(potentialReturn)}</strong>
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" isLoading={placeBet.isPending} onClick={handlePlaceBet}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
