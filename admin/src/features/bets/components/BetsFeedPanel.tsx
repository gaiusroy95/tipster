import { BetSlipIcon } from '@/shared/components/icons/BetSlipIcon'
import { BetSlipCard } from '@/features/bets/components/BetSlipCard'
import { groupBetsByDay, type AdminBet } from '@/features/bets/lib/betUtils'
import { Skeleton } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'

export function BetsFeedPanel({
  bets,
  total,
  isLoading,
  voidingId,
  onVoid,
  hasMore,
  onLoadMore,
  isLoadingMore,
}: {
  bets: AdminBet[]
  total: number
  isLoading: boolean
  voidingId: string | null
  onVoid: (bet: AdminBet) => void
  hasMore: boolean
  onLoadMore: () => void
  isLoadingMore: boolean
}) {
  const groups = groupBetsByDay(bets)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (bets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border-default/70 bg-bg-surface/40 px-6 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border-default bg-bg-elevated/50">
          <BetSlipIcon size="lg" className="text-accent-primary" />
        </div>
        <p className="mt-5 font-display text-xl font-bold">No slips in this stream</p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-text-muted">
          {total === 0
            ? 'When players place wagers in the arena, they will appear here in real time.'
            : 'Try a different status filter or search term to find bets.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.day}>
          <div className="sticky top-0 z-10 mb-4 flex items-center gap-3 bg-bg-primary/80 py-2 backdrop-blur-md">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border-default to-transparent" />
            <h2 className="shrink-0 font-display text-xs font-bold uppercase tracking-[0.2em] text-text-muted">
              {group.label}
            </h2>
            <span className="rounded-full border border-border-default/60 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-text-muted">
              {group.items.length}
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border-default to-transparent" />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {group.items.map((bet) => (
              <BetSlipCard
                key={bet.id}
                bet={bet}
                onVoid={onVoid}
                isVoiding={voidingId === bet.id}
              />
            ))}
          </div>
        </section>
      ))}

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <Button variant="secondary" onClick={onLoadMore} isLoading={isLoadingMore}>
            Load more slips
          </Button>
        </div>
      ) : bets.length > 0 && bets.length >= total ? (
        <p className="pb-4 text-center text-xs text-text-muted">
          End of stream · {total} total slip{total === 1 ? '' : 's'}
        </p>
      ) : null}
    </div>
  )
}
