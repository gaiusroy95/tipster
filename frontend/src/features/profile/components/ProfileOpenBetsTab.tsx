import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ActiveBetCard } from '@/features/bets/components/ActiveBetCard'
import { ActiveBetsSummary } from '@/features/bets/components/ActiveBetsSummary'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { EmptyState } from '@/shared/components/EmptyState'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { useCancelBet } from '@/features/bets/hooks/useBets'
import { calculateCancellationPenalty } from '@/core/config/bettingRules'
import { formatCredits } from '@/shared/utils/formatCredits'
import { ApiError } from '@/core/types/api'
import { useToast } from '@/shared/components/ui/Toast'
import { ROUTES } from '@/core/constants/routes'
import type { Bet } from '@/mocks/data/types'

export function ProfileOpenBetsTab({
  bets,
  loading,
  isOwnProfile,
  emptyTitle,
  emptyDescription,
}: {
  bets?: Bet[]
  loading: boolean
  isOwnProfile: boolean
  emptyTitle: string
  emptyDescription: string
}) {
  const cancelBet = useCancelBet()
  const { toast } = useToast()
  const [cancelTarget, setCancelTarget] = useState<Bet | null>(null)
  const items = bets ?? []

  const handleCancel = async () => {
    if (!cancelTarget) return
    try {
      await cancelBet.mutateAsync(cancelTarget.id)
      toast('Bet cancelled', 'success')
      setCancelTarget(null)
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Cancellation failed'
      toast(msg, 'error')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-44 rounded-2xl" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <section className="sidebar-panel p-6 sm:p-8">
        <EmptyState title={emptyTitle} description={emptyDescription} />
        {isOwnProfile && (
          <Link
            to={`${ROUTES.HOME}?tab=cup`}
            className="mt-4 block text-center text-sm font-semibold text-accent-secondary hover:underline"
          >
            Browse matches to place a bet →
          </Link>
        )}
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <section className="sidebar-panel p-4 sm:p-5">
        <ActiveBetsSummary bets={items} />
      </section>

      <div className="space-y-3">
        {items.map((bet) => (
          <ActiveBetCard
            key={bet.id}
            bet={bet}
            onCancel={isOwnProfile ? () => setCancelTarget(bet) : undefined}
          />
        ))}
      </div>

      {isOwnProfile && (
        <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel bet">
          {cancelTarget && (
            <div className="space-y-4">
              <p className="text-sm text-text-muted">
                Cancellation penalty:{' '}
                <strong className="text-accent-loss font-mono">
                  {formatCredits(calculateCancellationPenalty(cancelTarget.stake))} credits
                </strong>
                (10% of stake)
              </p>
              <p className="text-sm">
                Refund after penalty:{' '}
                <strong className="font-mono">
                  {formatCredits(
                    cancelTarget.stake - calculateCancellationPenalty(cancelTarget.stake),
                  )}
                </strong>
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setCancelTarget(null)}>
                  Keep bet
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  isLoading={cancelBet.isPending}
                  onClick={handleCancel}
                >
                  Confirm cancel
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
