import { useState } from 'react'
import { PageShell } from '@/shared/layouts/PageShell'
import { Input } from '@/shared/components/ui/Input'
import { RankingRow } from '@/shared/components/BetCard'
import { TopThreePodium } from '@/shared/components/TopThreePodium'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { useLeaderboard } from '@/features/leaderboard/hooks/useLeaderboard'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { cn } from '@/shared/utils/cn'

const sortOptions = [
  { id: 'points', label: 'Points' },
  { id: 'roi', label: 'ROI' },
  { id: 'profitLoss', label: 'P/L' },
  { id: 'winRate', label: 'Win rate' },
]

export function LeaderboardPage() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('points')
  const debouncedSearch = useDebounce(search)
  const { data, isLoading, isError, refetch } = useLeaderboard(debouncedSearch, sort)

  if (isError) {
    return (
      <PageShell title="Leaderboard">
        <QueryErrorFallback onRetry={() => refetch()} />
      </PageShell>
    )
  }

  return (
    <PageShell title="Leaderboard" description="Season rankings — compete for prizes">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex gap-2 flex-wrap">
          {sortOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSort(opt.id)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium min-h-[44px] border transition-colors',
                sort === opt.id
                  ? 'bg-accent-primary/15 border-accent-primary text-accent-primary'
                  : 'border-border-default bg-bg-surface text-text-muted',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {!isLoading && !debouncedSearch && sort === 'points' && data && data.length > 0 && (
        <TopThreePodium entries={data.slice(0, 3)} />
      )}

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <div className="space-y-2">
          {data?.map((entry) => (
            <RankingRow
              key={entry.userId}
              rank={entry.rank}
              displayName={entry.displayName}
              username={entry.username}
              userId={entry.userId}
              points={entry.points}
              roi={entry.roi}
              profitLoss={entry.profitLoss}
              form={entry.form}
            />
          ))}
        </div>
      )}
    </PageShell>
  )
}
