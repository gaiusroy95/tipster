import { useMemo, useState, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { LockClosedIcon } from '@heroicons/react/24/outline'
import { ROUTES } from '@/core/constants/routes'
import { ProfilePanelCard } from '@/features/profile/components/ProfilePanelCard'
import { Button } from '@/shared/components/ui/Button'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { formatCredits } from '@/shared/utils/formatCredits'
import { cn } from '@/shared/utils/cn'
import type { UserProfileStats } from '@/mocks/data/types'
import { hasBettingInsights } from '@/features/profile/lib/profileUtils'

const PerformanceChart = lazy(() =>
  import('@/shared/components/charts/PerformanceCharts').then((m) => ({
    default: m.PerformanceChart,
  })),
)

type RangeKey = '7d' | '1m' | 'all'

const RANGES: { id: RangeKey; label: string; days: number | null }[] = [
  { id: '7d', label: '7D', days: 7 },
  { id: '1m', label: '1M', days: 30 },
  { id: 'all', label: 'All time', days: null },
]

export function ProfileBalanceHistoryPanel({
  profile,
  isOwnProfile = false,
}: {
  profile: UserProfileStats
  isOwnProfile?: boolean
}) {
  const [range, setRange] = useState<RangeKey>('all')
  const unlocked = hasBettingInsights(profile)

  const filteredHistory = useMemo(() => {
    const history = profile.performanceHistory
    const rangeConfig = RANGES.find((r) => r.id === range)
    if (!rangeConfig?.days || history.length === 0) return history
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - rangeConfig.days)
    return history.filter((p) => new Date(p.date) >= cutoff)
  }, [profile.performanceHistory, range])

  const latestBalance =
    filteredHistory.length > 0
      ? filteredHistory[filteredHistory.length - 1].cumulative
      : profile.balance

  const periodDelta =
    filteredHistory.length >= 2
      ? filteredHistory[filteredHistory.length - 1].cumulative - filteredHistory[0].cumulative
      : 0

  if (!unlocked) {
    return (
      <ProfilePanelCard title="Arena balance history" subtitle="Virtual credits over time">
        <div className="flex flex-col items-center justify-center text-center py-8 px-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-elevated border border-border-default mb-4">
            <LockClosedIcon className="h-7 w-7 text-text-muted" aria-hidden="true" />
          </div>
          <p className="font-semibold">No balance history yet</p>
          <p className="text-sm text-text-muted mt-2 max-w-xs leading-relaxed">
            Balance charts appear after this tipster places virtual bets.
          </p>
        </div>
      </ProfilePanelCard>
    )
  }

  return (
    <ProfilePanelCard
      title="Arena balance history"
      subtitle="Track bankroll movement"
      action={
        <div className="flex gap-1 shrink-0">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              className={cn(
                'rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors',
                range === r.id
                  ? 'bg-accent-secondary/20 text-accent-secondary'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      }
      bodyClassName="space-y-4"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Current balance</p>
          <p className="font-mono text-2xl font-bold text-accent-gold tabular-nums mt-0.5">
            {formatCredits(latestBalance)}
          </p>
        </div>
        {periodDelta !== 0 && (
          <p
            className={cn(
              'font-mono text-sm font-semibold tabular-nums',
              periodDelta >= 0 ? 'text-accent-win' : 'text-accent-loss',
            )}
          >
            {periodDelta >= 0 ? '+' : ''}{formatCredits(periodDelta)}
            <span className="text-text-muted font-normal text-xs ml-1">in range</span>
          </p>
        )}
      </div>
      <div className="min-h-[200px] -mx-1">
        <Suspense fallback={<Skeleton className="h-[200px] w-full rounded-lg" />}>
          <PerformanceChart data={filteredHistory} />
        </Suspense>
      </div>
      {isOwnProfile && (
        <Link to={ROUTES.WALLET} className="block">
          <Button variant="secondary" size="sm" className="w-full">Open wallet</Button>
        </Link>
      )}
    </ProfilePanelCard>
  )
}
