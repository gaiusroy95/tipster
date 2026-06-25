import { Link } from 'react-router-dom'
import { ArrowRightIcon, SignalIcon } from '@heroicons/react/24/outline'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/ui/Button'
import {
  daysRemaining,
  formatSeasonRange,
  getGreeting,
  seasonProgress,
  type DashboardStats,
} from '@/features/dashboard/lib/dashboardUtils'
import { cn } from '@/shared/utils/cn'

export function DashboardHero({
  adminName,
  stats,
}: {
  adminName: string
  stats: DashboardStats
}) {
  const firstName = adminName.trim().split(/\s+/)[0] ?? adminName
  const progress = stats.activeSeason
    ? seasonProgress(stats.activeSeason.startDate, stats.activeSeason.endDate)
    : null
  const remaining = stats.activeSeason ? daysRemaining(stats.activeSeason.endDate) : null
  const engagement = stats.userCount + stats.activeBets + stats.forumPosts

  return (
    <section className="dashboard-hero relative overflow-hidden rounded-3xl border border-border-default/60 p-5 sm:p-7 lg:p-8">
      <div className="dashboard-hero-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent-secondary/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-accent-primary/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="dashboard-live-pill inline-flex items-center gap-2 rounded-full border border-accent-win/30 bg-accent-win/10 px-3 py-1 text-xs font-semibold text-accent-win">
              <span className="dashboard-live-dot h-2 w-2 rounded-full bg-accent-win" aria-hidden="true" />
              Platform operational
            </span>
            {stats.activeSeason ? (
              <Badge variant="primary">{stats.activeSeason.name}</Badge>
            ) : (
              <Badge>No active season</Badge>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-text-muted">{getGreeting()},</p>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
              {firstName}
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-text-muted sm:text-base">
              Your command center for Tipster Arena — monitor the arena, moderate the community,
              and keep the season running smoothly.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-border-default/80 bg-bg-primary/40 px-3 py-1.5 text-xs text-text-muted">
              <span className="font-semibold text-text-primary">{engagement}</span> total signals
            </span>
            <span className="rounded-full border border-border-default/80 bg-bg-primary/40 px-3 py-1.5 text-xs text-text-muted">
              <span className="font-semibold text-accent-primary">{stats.activeBets}</span> live bets
            </span>
            <span className="rounded-full border border-border-default/80 bg-bg-primary/40 px-3 py-1.5 text-xs text-text-muted">
              <span className="font-semibold text-accent-secondary">{stats.enabledLeagues}</span> leagues live
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
          {stats.activeSeason && progress !== null ? (
            <div className="w-full rounded-2xl border border-border-default/70 bg-bg-primary/50 p-4 backdrop-blur-sm sm:min-w-[260px] lg:w-[280px]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                    Season progress
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold tabular-nums">
                    {Math.round(progress)}%
                  </p>
                </div>
                <div className="relative flex h-14 w-14 items-center justify-center">
                  <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56" aria-hidden="true">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-border-default"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${(progress / 100) * 150.8} 150.8`}
                      className="text-accent-primary"
                    />
                  </svg>
                  <SignalIcon className="absolute h-5 w-5 text-accent-primary" aria-hidden="true" />
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-text-muted">
                {formatSeasonRange(stats.activeSeason.startDate, stats.activeSeason.endDate)}
              </p>
              {remaining !== null ? (
                <p className="mt-1 text-xs font-medium text-accent-primary">
                  {remaining} day{remaining === 1 ? '' : 's'} remaining
                </p>
              ) : null}
            </div>
          ) : null}

          <Link to="/audit" className="w-full sm:w-auto lg:w-[280px]">
            <Button variant="secondary" className="w-full group">
              View audit log
              <ArrowRightIcon
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export function DashboardHeroSkeleton() {
  return (
    <div className={cn('dashboard-hero rounded-3xl border border-border-default/60 p-7 lg:p-8')}>
      <div className="space-y-4">
        <div className="h-6 w-40 animate-pulse rounded-full bg-bg-elevated" />
        <div className="h-10 w-64 animate-pulse rounded-lg bg-bg-elevated" />
        <div className="h-4 w-full max-w-lg animate-pulse rounded bg-bg-elevated" />
      </div>
    </div>
  )
}
