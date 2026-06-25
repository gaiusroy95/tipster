import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BetSlipEmptyIcon } from '@/features/betting/components/BetSlipEmptyIcon'
import { BetSlipSelectionRow } from '@/features/betting/components/BetSlipSelectionRow'
import { BetSlipSummaryFooter } from '@/features/betting/components/BetSlipSummaryFooter'
import { BetSlipConfirmModal } from '@/features/betting/components/BetSlipConfirmModal'
import {
  useBetSlipStore,
  resolveSelectionStake,
  type BetSelection,
} from '@/features/betting/stores/betSlipStore'
import { usePlaceBet, useDailyBetLimit, reconcileBetPlacement } from '@/features/bets/hooks/useBets'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { bettingRules, isValidStake } from '@/core/config/bettingRules'
import { calcBetReturn } from '@/features/betting/lib/betSlipUtils'
import { formatCredits } from '@/shared/utils/formatCredits'
import { ApiError } from '@/core/types/api'
import { useToast } from '@/shared/components/ui/Toast'
import { cn } from '@/shared/utils/cn'
import { ROUTES } from '@/core/constants/routes'
import { FIXTURE_VIEWS } from '@/core/constants/sports'

const BROWSE_MATCHES_PATH = `${ROUTES.HOME}?tab=cup&view=${FIXTURE_VIEWS.UPCOMING}`

function selectionStake(sel: BetSelection): number {
  return resolveSelectionStake(sel)
}

export function BetSlipPanelContent({ compact = false }: { compact?: boolean }) {
  const selections = useBetSlipStore((s) => s.selections)
  const setSelectionStake = useBetSlipStore((s) => s.setSelectionStake)
  const removeSelection = useBetSlipStore((s) => s.removeSelection)
  const clear = useBetSlipStore((s) => s.clear)
  const setPanelOpen = useBetSlipStore((s) => s.setPanelOpen)
  const balance = useAuthStore((s) => s.user?.balance ?? 0)
  const placeBet = usePlaceBet()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { data: dailyLimit } = useDailyBetLimit()
  const { toast } = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [stakeError, setStakeError] = useState<string | undefined>()
  const [isPlacingAll, setIsPlacingAll] = useState(false)

  const totalStake = selections.reduce((sum, sel) => sum + selectionStake(sel), 0)
  const totalPotentialReturn = selections.reduce(
    (sum, sel) => sum + calcBetReturn(selectionStake(sel), sel.odds, sel.marketType),
    0,
  )

  const betsUsed = dailyLimit?.betsUsed ?? 0
  const betsLimit = dailyLimit?.betsLimit ?? bettingRules.dailyBetLimit
  const betsRemaining = Math.max(0, betsLimit - betsUsed)
  const dailyLimitReached = betsRemaining === 0
  const tooManySelections = selections.length > betsRemaining

  const validateSlip = (): boolean => {
    const invalidStake = selections.find((sel) => !isValidStake(selectionStake(sel)))
    if (invalidStake) {
      setStakeError(
        `Choose ${formatCredits(bettingRules.standardStake)} or ${formatCredits(bettingRules.premiumStake)} credits for each match`,
      )
      return false
    }
    if (totalStake > balance) {
      setStakeError('Insufficient virtual credits for total stake')
      return false
    }
    if (dailyLimitReached) {
      setStakeError(`Daily bet limit reached (${betsLimit}/${betsLimit})`)
      return false
    }
    if (tooManySelections) {
      setStakeError(
        `Only ${betsRemaining} bet${betsRemaining === 1 ? '' : 's'} left today — remove ${selections.length - betsRemaining} selection${selections.length - betsRemaining === 1 ? '' : 's'}`,
      )
      return false
    }
    setStakeError(undefined)
    return true
  }

  const finishSuccessfulPlacement = (count: number) => {
    clear()
    setConfirmOpen(false)
    setPanelOpen(false)
    toast(
      count === 1 ? 'Bet placed successfully!' : `${count} bets placed successfully!`,
      'success',
    )
    navigate(ROUTES.BETS_ACTIVE)
  }

  const handlePlaceAllBets = async () => {
    if (!validateSlip()) return

    setIsPlacingAll(true)
    const placedMatchIds: string[] = []

    try {
      for (const sel of selections) {
        const stake = selectionStake(sel)
        const payload = {
          matchId: sel.matchId,
          marketType: sel.marketType,
          selectionId: sel.selectionId,
          stake,
        }

        try {
          await placeBet.mutateAsync(payload)
          placedMatchIds.push(sel.matchId)
        } catch (e) {
          const recovered = await reconcileBetPlacement(payload, queryClient)
          if (recovered) {
            placedMatchIds.push(sel.matchId)
            continue
          }

          placedMatchIds.forEach((id) => removeSelection(id))
          const msg = e instanceof ApiError ? e.message : 'Failed to place bet'
          toast(
            placedMatchIds.length > 0
              ? `${placedMatchIds.length} bet(s) placed. Failed on ${sel.homeTeam} v ${sel.awayTeam}: ${msg}`
              : msg,
            'error',
          )
          setConfirmOpen(false)
          return
        }
      }

      finishSuccessfulPlacement(placedMatchIds.length)
    } finally {
      setIsPlacingAll(false)
    }
  }

  if (selections.length === 0) {
    const closePanel = () => setPanelOpen(false)

    return (
      <div className={cn(compact ? 'py-10 px-1' : 'py-14', 'text-center')}>
        <div className="mx-auto flex max-w-[240px] flex-col items-center">
          <Link
            to={BROWSE_MATCHES_PATH}
            onClick={closePanel}
            className="mb-5 opacity-90 transition-opacity hover:opacity-100"
            aria-label="Browse matches to add a bet"
          >
            <BetSlipEmptyIcon size="lg" />
          </Link>
          <h3 className="font-display text-base font-semibold tracking-tight text-text-primary">
            No selections yet
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Choose odds from any match, set your stake, and place your virtual bet.
          </p>
          <Link
            to={BROWSE_MATCHES_PATH}
            className="mt-6 text-sm font-medium text-accent-secondary hover:underline"
            onClick={closePanel}
          >
            Browse matches
          </Link>
        </div>
      </div>
    )
  }

  const placeBetLabel =
    selections.length === 1
      ? 'Place virtual bet'
      : `Place ${selections.length} virtual bets`

  const summaryFooter = (
    <BetSlipSummaryFooter
      totalStake={totalStake}
      totalPotentialReturn={totalPotentialReturn}
      balance={balance}
      betsUsed={betsUsed}
      betsLimit={betsLimit}
      dailyLimitReached={dailyLimitReached}
      tooManySelections={tooManySelections}
      stakeError={stakeError}
      placeBetLabel={placeBetLabel}
      onPlaceClick={() => {
        if (validateSlip()) setConfirmOpen(true)
      }}
      disabled={dailyLimitReached || tooManySelections}
    />
  )

  const selectionCards = (
    <div className="space-y-3">
      {selections.map((sel) => {
        const stake = selectionStake(sel)
        const potentialReturn = calcBetReturn(stake, sel.odds, sel.marketType)

        return (
          <BetSlipSelectionRow
            key={sel.matchId}
            selection={sel}
            stake={stake}
            potentialReturn={potentialReturn}
            onStakeChange={(amount) => {
              setSelectionStake(sel.matchId, amount)
              setStakeError(undefined)
            }}
            onRemove={() => removeSelection(sel.matchId)}
          />
        )
      })}
    </div>
  )

  return (
    <>
      <div className={cn('flex flex-col', compact && 'min-h-0 flex-1')}>
        <div className={cn(compact && 'min-h-0 flex-1 overflow-y-auto')}>{selectionCards}</div>
        <div className={cn(compact ? 'shrink-0 pt-4' : 'pt-5')}>{summaryFooter}</div>
      </div>

      <BetSlipConfirmModal
        open={confirmOpen}
        selections={selections}
        totalStake={totalStake}
        totalPotentialReturn={totalPotentialReturn}
        isPlacing={isPlacingAll}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handlePlaceAllBets}
      />
    </>
  )
}
