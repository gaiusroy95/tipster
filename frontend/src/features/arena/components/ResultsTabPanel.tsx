import { BetCard } from '@/shared/components/BetCard'
import { useBets } from '@/features/bets/hooks/useBets'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { EmptyState } from '@/shared/components/EmptyState'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'

export function ResultsTabPanel() {
  const { data, isLoading, isError, refetch } = useBets()

  if (isError) return <QueryErrorFallback onRetry={() => refetch()} />

  const settled = data?.filter((b) => b.status !== 'active') ?? []

  return (
    <div>
      <h2 className="font-display text-lg font-bold mb-4">Past results</h2>
      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      ) : settled.length === 0 ? (
        <EmptyState title="No settled bets yet" description="Your completed and cancelled bets appear here." />
      ) : (
        <div className="space-y-4">
          {settled.map((bet) => <BetCard key={bet.id} bet={bet} />)}
        </div>
      )}
    </div>
  )
}
