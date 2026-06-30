import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '@/shared/layouts/PageShell'
import { PageHero } from '@/shared/components/PageHero'
import { Input } from '@/shared/components/ui/Input'
import { RankingRow } from '@/shared/components/BetCard'
import { TopThreePodium } from '@/shared/components/TopThreePodium'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { useLeaderboard } from '@/features/leaderboard/hooks/useLeaderboard'
import { useActiveSeason } from '@/features/seasons/hooks/useSeasons'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { ROUTES } from '@/core/constants/routes'
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
  const activeSeason = useActiveSeason()

  const header = (
    <PageHero
      variant="leaderboard"
      title="Leaderboard"
      description="Season rankings — compete for prizes"
      extra={
        activeSeason.data ? (
          <Link
            to={ROUTES.SEASONS}
            className="rounded-xl border border-accent-gold/25 bg-accent-gold/5 px-4 py-3 text-center @3xl:text-left transition-colors hover:border-accent-gold/40 hover:bg-accent-gold/10 min-w-[140px]"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-accent-gold">Active season</p>
            <p className="mt-0.5 font-display text-sm font-bold text-text-primary leading-tight">
              {activeSeason.data.name}
            </p>
          </Link>
        ) : undefined
      }
    />
  )

  if (isError) {
    return (
      <PageShell header={header}>
        <QueryErrorFallback onRetry={() => refetch()} />
      </PageShell>
    )
  }

  return (
    <PageShell header={header}>
      <div className="flex flex-col sm:flex-row gap-4">
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
                  : 'border-border-default bg-bg-surface text-text-muted hover:text-text-primary hover:border-border-strong',
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
        <div
          className="leaderboard-rankings-scroll scrollbar-panel space-y-2 rounded-xl border border-border-default/60 bg-bg-surface/40 p-2"
          aria-label="Player rankings"
        >
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
