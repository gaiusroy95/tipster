import { useState } from 'react'
import { PageShell } from '@/shared/layouts/PageShell'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Label, FieldError } from '@/shared/components/ui/Label'
import { Modal } from '@/shared/components/ui/Modal'
import { EmptyState } from '@/shared/components/EmptyState'
import { useBetSlipStore } from '@/features/betting/stores/betSlipStore'
import { usePlaceBet } from '@/features/bets/hooks/useBets'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { bettingRules, getBetSize, isValidStake } from '@/core/config/bettingRules'
import { formatCredits } from '@/shared/utils/formatCredits'
import { formatMalayOdds, formatDecimalOdds } from '@/shared/utils/formatOdds'
import { ApiError } from '@/core/types/api'
import { useToast } from '@/shared/components/ui/Toast'
import { cn } from '@/shared/utils/cn'
import { TicketIcon } from '@heroicons/react/24/outline'

function calcReturn(stake: number, odds: number, marketType: string): number {
  if (marketType === 'malay') {
    if (odds > 0) return Math.round(stake + stake * odds)
    return Math.round(stake + stake)
  }
  return Math.round(stake * (odds > 0 ? odds : 2))
}

export function BetSlipPage() {
  const selections = useBetSlipStore((s) => s.selections)
  const stake = useBetSlipStore((s) => s.stake)
  const setStake = useBetSlipStore((s) => s.setStake)
  const removeSelection = useBetSlipStore((s) => s.removeSelection)
  const clear = useBetSlipStore((s) => s.clear)
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
        `Stake must be 1–${bettingRules.smallBetMax} (small) or ${bettingRules.bigBetMin}–${bettingRules.bigBetMax} (big)`,
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
      toast('Bet placed successfully!', 'success')
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to place bet'
      toast(msg, 'error')
    }
  }

  if (selections.length === 0) {
    return (
      <PageShell title="Bet slip">
        <EmptyState
          title="Your bet slip is empty"
          description="Browse fixtures and add a selection to place a virtual bet."
          icon={<TicketIcon className="h-12 w-12" />}
        />
      </PageShell>
    )
  }

  return (
    <PageShell title="Bet slip" description="Single selection betting (MVP)">
      <div className="space-y-4">
        {selections.map((sel) => (
          <div key={sel.matchId} className="rounded-xl border border-border-default bg-bg-surface p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{sel.homeTeam} vs {sel.awayTeam}</p>
                <p className="text-sm text-text-muted mt-1">{sel.selectionLabel}</p>
                <p className="text-xs text-text-muted capitalize mt-1">
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

        <div className="rounded-xl border border-border-default bg-bg-surface p-4 space-y-4">
          <div>
            <Label htmlFor="stake">Stake (credits)</Label>
            <Input
              id="stake"
              type="number"
              min={1}
              value={stake}
              onChange={(e) => {
                setStake(Number(e.target.value))
                setStakeError(undefined)
              }}
              error={stakeError}
            />
            <FieldError message={stakeError} />
            <div className="flex flex-wrap gap-2 mt-3">
              {[100, 500, 1000, 5000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    setStake(amount)
                    setStakeError(undefined)
                  }}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-sm font-mono font-semibold min-h-[44px] transition-colors',
                    stake === amount
                      ? 'border-accent-primary bg-accent-primary/15 text-accent-primary'
                      : 'border-border-default bg-bg-elevated text-text-muted hover:border-accent-primary/40',
                  )}
                >
                  {formatCredits(amount)}
                </button>
              ))}
            </div>
            <p className="text-xs text-text-muted mt-2">
              Balance: {formatCredits(balance)} · Small: ≤{bettingRules.smallBetMax} · Big:{' '}
              {bettingRules.bigBetMin}–{bettingRules.bigBetMax} (max {bettingRules.dailyBigBetLimit}/day)
            </p>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Bet type</span>
            <span className="font-medium capitalize">{betSize ?? '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
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
            You are placing a <strong className="text-text-primary">{betSize}</strong> virtual bet
            for <strong className="text-text-primary font-mono">{formatCredits(stake)}</strong> credits.
          </p>
          <p className="text-sm">
            Selection: <strong>{selection?.selectionLabel}</strong>
          </p>
          <p className="text-sm">
            Potential return: <strong className="text-accent-primary font-mono">{formatCredits(potentialReturn)}</strong>
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
    </PageShell>
  )
}
