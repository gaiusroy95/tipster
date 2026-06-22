import { useParams } from 'react-router-dom'
import { PageShell } from '@/shared/layouts/PageShell'
import { StatCard } from '@/shared/components/StatCard'
import { BetCard, FormStreak } from '@/shared/components/BetCard'
import { PerformanceChart, LeagueBarChart } from '@/shared/components/charts/PerformanceCharts'
import { Skeleton, SkeletonCard } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { usePlayerProfile, usePlayerBets } from '@/features/profile/hooks/useProfile'
import { formatCredits, formatRoi, formatPercent } from '@/shared/utils/formatCredits'
import { formatDateTime } from '@/shared/utils/formatDate'

export function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const profile = usePlayerProfile(userId ?? '')
  const bets = usePlayerBets(userId ?? '')

  if (profile.isLoading) {
    return (
      <PageShell title="Player profile">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </PageShell>
    )
  }

  if (profile.isError || !profile.data) {
    return (
      <PageShell title="Player profile">
        <QueryErrorFallback onRetry={() => profile.refetch()} />
      </PageShell>
    )
  }

  const p = profile.data

  return (
    <PageShell
      title={p.displayName}
      description={`@${p.username} · Rank #${p.rank}`}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Points" value={String(p.seasonStats.points)} />
        <StatCard label="ROI" value={formatRoi(p.seasonStats.roi)} trend={p.seasonStats.roi >= 0 ? 'up' : 'down'} />
        <StatCard
          label="Profit/Loss"
          value={formatCredits(p.seasonStats.profitLoss)}
          trend={p.seasonStats.profitLoss >= 0 ? 'up' : 'down'}
        />
        <StatCard label="Win rate" value={formatPercent(p.seasonStats.winRate)} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total bets" value={String(p.seasonStats.totalBets)} />
        <StatCard label="Wins / Losses" value={`${p.seasonStats.wins} / ${p.seasonStats.losses}`} />
        <StatCard label="Active bets" value={String(p.seasonStats.activeBets)} />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Recent form</h2>
        <FormStreak form={p.form} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border-default bg-bg-surface p-4">
          <h2 className="text-lg font-semibold mb-4">Performance over time</h2>
          <PerformanceChart data={p.performanceHistory} />
        </div>
        <div className="rounded-xl border border-border-default bg-bg-surface p-4">
          <h2 className="text-lg font-semibold mb-4">League performance</h2>
          <LeagueBarChart
            data={p.leaguePerformance.map((l) => ({
              leagueName: l.leagueName,
              profitLoss: l.profitLoss,
            }))}
          />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Achievements</h2>
        <div className="flex flex-wrap gap-3">
          {p.achievements.map((a) => (
            <div key={a.id} className="rounded-xl border border-accent-gold/30 bg-accent-gold/10 p-4 max-w-xs">
              <p className="font-semibold text-accent-gold">{a.name}</p>
              <p className="text-sm text-text-muted mt-1">{a.description}</p>
              <p className="text-xs text-text-muted mt-2">{formatDateTime(a.earnedAt)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Betting history</h2>
        {bets.isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="space-y-4">
            {bets.data?.slice(0, 5).map((bet) => (
              <BetCard key={bet.id} bet={bet} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-border-default bg-bg-surface p-4">
        <h2 className="text-sm font-medium text-text-muted mb-3">Betting stats</h2>
        <div className="grid gap-2 sm:grid-cols-3 text-sm">
          <div>
            <span className="text-text-muted">Avg stake</span>
            <p className="font-mono font-semibold">{formatCredits(p.bettingStats.avgStake)}</p>
          </div>
          <div>
            <span className="text-text-muted">Biggest win</span>
            <p className="font-mono font-semibold text-accent-win">{formatCredits(p.bettingStats.biggestWin)}</p>
          </div>
          <div>
            <span className="text-text-muted">Favorite market</span>
            <p className="font-medium capitalize">{p.bettingStats.favoriteMarket.replace('_', '/')}</p>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
