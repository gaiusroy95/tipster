import { Link } from 'react-router-dom'
import { LockClosedIcon } from '@heroicons/react/24/outline'
import { ROUTES } from '@/core/constants/routes'
import { PerformanceChart } from '@/shared/components/charts/PerformanceCharts'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/utils/cn'
import type { UserProfileStats } from '@/mocks/data/types'
import { hasBettingInsights } from '@/features/profile/lib/profileUtils'

export function ProfileInsightsPanel({
  profile,
  title,
  chart = false,
}: {
  profile: UserProfileStats
  title: string
  chart?: boolean
}) {
  const unlocked = hasBettingInsights(profile)

  return (
    <section className="sidebar-panel p-4 sm:p-5 h-full flex flex-col min-h-[240px]">
      <h2 className="font-display text-base font-bold mb-4">{title}</h2>
      {unlocked ? (
        chart ? (
          <div className="flex-1 min-h-[180px]">
            <PerformanceChart data={profile.performanceHistory} />
          </div>
        ) : (
          <div className="flex-1 space-y-3">
            <p className="text-sm text-text-muted">
              You are ranked{' '}
              <strong className="text-text-primary font-mono">#{profile.rank}</strong> with{' '}
              <strong className="text-accent-win font-mono">{profile.seasonStats.points}</strong> season points.
            </p>
            <div className="rounded-lg bg-bg-elevated/50 border border-border-default/60 p-3 text-sm">
              <div className="flex justify-between py-1.5">
                <span className="text-text-muted">ROI</span>
                <span className="font-mono font-semibold">{profile.seasonStats.roi.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between py-1.5 border-t border-border-default/50">
                <span className="text-text-muted">Profit / loss</span>
                <span
                  className={cn(
                    'font-mono font-semibold',
                    profile.seasonStats.profitLoss >= 0 ? 'text-accent-win' : 'text-accent-loss',
                  )}
                >
                  {profile.seasonStats.profitLoss >= 0 ? '+' : ''}
                  {profile.seasonStats.profitLoss}
                </span>
              </div>
            </div>
            <Link to={ROUTES.LEADERBOARD}>
              <Button variant="secondary" size="sm" className="w-full">
                View full leaderboard
              </Button>
            </Link>
          </div>
        )
      ) : (
        <LockedInsights />
      )}
    </section>
  )
}

function LockedInsights() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-elevated border border-border-default mb-4">
        <LockClosedIcon className="h-7 w-7 text-text-muted" aria-hidden="true" />
      </div>
      <p className="font-semibold text-text-primary">Get your first insights</p>
      <p className="text-sm text-text-muted mt-2 max-w-[240px] leading-relaxed">
        Charts and ranking breakdowns unlock after your first round of virtual bets.
      </p>
      <Link to={`${ROUTES.HOME}?tab=cup`} className="mt-5">
        <Button size="sm">Explore Tipster Cup</Button>
      </Link>
    </div>
  )
}
