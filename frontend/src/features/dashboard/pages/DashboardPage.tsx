import { Link } from 'react-router-dom'
import { PageShell } from '@/shared/layouts/PageShell'
import { StatCard } from '@/shared/components/StatCard'
import { FormStreak } from '@/shared/components/BetCard'
import { SkeletonCard } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { Button } from '@/shared/components/ui/Button'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { formatCredits, formatProfitLoss } from '@/shared/utils/formatCredits'
import { formatDateTime } from '@/shared/utils/formatDate'
import { ROUTES } from '@/core/constants/routes'

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboard()

  if (isLoading) {
    return (
      <PageShell title="Dashboard">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </PageShell>
    )
  }

  if (isError || !data) {
    return (
      <PageShell title="Dashboard">
        <QueryErrorFallback onRetry={() => refetch()} />
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Dashboard"
      description="Your competition overview"
      action={
        <Link to={ROUTES.FIXTURES}>
          <Button>Browse fixtures</Button>
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Balance" value={formatCredits(data.balance)} subValue="Virtual credits" />
        <StatCard label="Rank" value={`#${data.rank}`} subValue="Season ranking" />
        <StatCard
          label="Active bets"
          value={String(data.activeBetsCount)}
          subValue="Open positions"
        />
        <StatCard
          label="Today P/L"
          value={formatProfitLoss(data.todayProfitLoss)}
          trend={data.todayProfitLoss >= 0 ? 'up' : 'down'}
        />
      </div>

      {data.form.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-text-muted mb-3">Current form</h2>
          <FormStreak form={data.form} />
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Recent activity</h2>
        {data.recentActivity.length === 0 ? (
          <p className="text-text-muted text-sm">No recent activity</p>
        ) : (
          <div className="space-y-2">
            {data.recentActivity.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border-default bg-bg-surface text-sm"
              >
                <div>
                  <p className="font-medium">{tx.description}</p>
                  <p className="text-xs text-text-muted">{formatDateTime(tx.createdAt)}</p>
                </div>
                <span
                  className={`font-mono font-semibold ${tx.amount >= 0 ? 'text-accent-win' : 'text-accent-loss'}`}
                >
                  {tx.amount >= 0 ? '+' : ''}{formatCredits(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
