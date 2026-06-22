import { useState } from 'react'
import { PageShell } from '@/shared/layouts/PageShell'
import { BetCard } from '@/shared/components/BetCard'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { EmptyState } from '@/shared/components/EmptyState'
import { useBets, useCancelBet } from '@/features/bets/hooks/useBets'
import { calculateCancellationPenalty } from '@/core/config/bettingRules'
import { formatCredits } from '@/shared/utils/formatCredits'
import { ApiError } from '@/core/types/api'
import { useToast } from '@/shared/components/ui/Toast'
import type { Bet } from '@/mocks/data/types'

export function ActiveBetsPage() {
  const { data, isLoading, isError, refetch } = useBets('active')
  const cancelBet = useCancelBet()
  const { toast } = useToast()
  const [cancelTarget, setCancelTarget] = useState<Bet | null>(null)

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

  if (isLoading) {
    return (
      <PageShell title="Active bets">
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      </PageShell>
    )
  }

  if (isError) {
    return (
      <PageShell title="Active bets">
        <QueryErrorFallback onRetry={() => refetch()} />
      </PageShell>
    )
  }

  return (
    <PageShell title="Active bets" description="Open virtual bet positions">
      {data?.length === 0 ? (
        <EmptyState title="No active bets" description="Place a bet on upcoming fixtures to get started." />
      ) : (
        <div className="space-y-4">
          {data?.map((bet) => (
            <div key={bet.id} className="space-y-2">
              <BetCard bet={bet} />
              <Button variant="danger" size="sm" onClick={() => setCancelTarget(bet)}>
                Cancel bet
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel bet"
      >
        {cancelTarget && (
          <div className="space-y-4">
            <p className="text-sm text-text-muted">
              Cancellation penalty:{' '}
              <strong className="text-accent-loss font-mono">
                {formatCredits(calculateCancellationPenalty(cancelTarget.stake))} credits
              </strong>
              ({10}% of stake)
            </p>
            <p className="text-sm">
              Refund after penalty:{' '}
              <strong className="font-mono">
                {formatCredits(cancelTarget.stake - calculateCancellationPenalty(cancelTarget.stake))}
              </strong>
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setCancelTarget(null)}>
                Keep bet
              </Button>
              <Button variant="danger" className="flex-1" isLoading={cancelBet.isPending} onClick={handleCancel}>
                Confirm cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageShell>
  )
}
