import { useState } from 'react'
import { Input } from '@/shared/components/ui/Input'
import { RankingRow } from '@/shared/components/BetCard'
import { TopThreePodium } from '@/shared/components/TopThreePodium'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { useLeaderboard } from '@/features/leaderboard/hooks/useLeaderboard'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { cn } from '@/shared/utils/cn'

export function LeaderboardTabPanel() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('points')
  const debouncedSearch = useDebounce(search)
  const { data, isLoading, isError, refetch } = useLeaderboard(debouncedSearch, sort)

  if (isError) return <QueryErrorFallback onRetry={() => refetch()} />

  const sortOptions = [
    { id: 'points', label: 'Points' },
    { id: 'roi', label: 'ROI' },
    { id: 'profitLoss', label: 'P/L' },
    { id: 'winRate', label: 'Win %' },
  ]

  return (
    <div>
      <h2 className="font-display text-lg font-bold mb-4">Season leaderboard</h2>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Search tipsters..."
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
                'px-3 py-1.5 rounded-full text-xs font-bold min-h-[36px] border',
                sort === opt.id
                  ? 'border-accent-primary bg-accent-primary/15 text-accent-primary'
                  : 'border-border-default text-text-muted',
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
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
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
    </div>
  )
}
