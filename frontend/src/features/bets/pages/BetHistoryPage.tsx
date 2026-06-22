import { PageShell } from '@/shared/layouts/PageShell'
import { BetCard } from '@/shared/components/BetCard'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { EmptyState } from '@/shared/components/EmptyState'
import { useBets } from '@/features/bets/hooks/useBets'

export function BetHistoryPage() {
  const { data, isLoading, isError, refetch } = useBets()

  if (isLoading) {
    return (
      <PageShell title="Betting history">
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      </PageShell>
    )
  }

  if (isError) {
    return (
      <PageShell title="Betting history">
        <QueryErrorFallback onRetry={() => refetch()} />
      </PageShell>
    )
  }

  const settled = data?.filter((b) => b.status !== 'active') ?? []

  return (
    <PageShell title="Betting history" description="All settled and cancelled bets">
      {settled.length === 0 ? (
        <EmptyState title="No history yet" description="Your settled bets will appear here." />
      ) : (
        <div className="space-y-4">
          {settled.map((bet) => <BetCard key={bet.id} bet={bet} />)}
        </div>
      )}
    </PageShell>
  )
}
