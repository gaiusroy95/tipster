import { Link } from 'react-router-dom'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, StarIcon, TrophyIcon } from '@heroicons/react/24/outline'
import { ROUTES } from '@/core/constants/routes'
import { formatRankChange, overallRankTier } from '@/features/profile/lib/overallRank'
import { RankBadge } from '@/shared/components/RankBadge'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/utils/cn'
import type { OverallRankStats } from '@/mocks/data/types'

interface OverallRankPanelProps {
  stats: OverallRankStats
  className?: string
}

function StatTile({
  label,
  value,
  sub,
  valueClassName,
}: {
  label: string
  value: string
  sub?: string
  valueClassName?: string
}) {
  return (
    <div className="rounded-xl border border-border-default/60 bg-bg-elevated/40 px-3 py-2.5 min-h-[72px] flex flex-col justify-between">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <div>
        <p className={cn('font-display text-lg font-bold tabular-nums leading-tight', valueClassName)}>{value}</p>
        {sub && <p className="text-[10px] text-text-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export function OverallRankPanel({ stats, className }: OverallRankPanelProps) {
  const tier = overallRankTier(stats.current)
  const change = formatRankChange(stats.rankChange)
  const atTopTier = stats.current <= 10

  return (
    <section
      className={cn(
        'sidebar-panel overflow-hidden',
        className,
      )}
      aria-label="Overall rank"
    >
      <div className="relative bg-gradient-to-br from-accent-secondary/12 via-bg-surface to-bg-surface">
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-secondary/60 to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent-gold/10 blur-2xl"
          aria-hidden="true"
        />

        <div className="relative px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <RankBadge rank={stats.current} size="lg" className="shrink-0" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight">Overall rank</h2>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                      tier.className,
                    )}
                  >
                    <StarIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
                    {stats.tierLabel}
                  </span>
                </div>
                <p className="text-sm text-text-muted mt-1">
                  <span className="font-semibold text-text-primary tabular-nums">#{stats.current}</span>
                  <span className="mx-1.5 text-border-default">·</span>
                  of {stats.totalPlayers.toLocaleString()} tipsters
                </p>
                <p className="text-xs text-accent-secondary font-semibold mt-1">
                  Top {stats.percentile}% on the season leaderboard
                </p>
              </div>
            </div>

            <Link to={ROUTES.LEADERBOARD} className="shrink-0 w-full sm:w-auto">
              <Button variant="secondary" size="sm" className="w-full sm:w-auto gap-2">
                <TrophyIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                View leaderboard
              </Button>
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <StatTile
              label="Best rank"
              value={`#${stats.best}`}
              sub="Personal best"
            />
            <StatTile
              label="Season points"
              value={stats.seasonPoints.toLocaleString()}
              sub="Leaderboard score"
              valueClassName="text-accent-gold"
            />
            <StatTile
              label="This week"
              value={change.label}
              sub="Rank change"
              valueClassName={cn(
                change.neutral && 'text-text-muted',
                change.positive && 'text-accent-win',
                !change.positive && !change.neutral && 'text-accent-loss',
              )}
            />
            <StatTile
              label="Next tier"
              value={atTopTier ? stats.tierLabel : stats.nextTierLabel}
              sub={
                atTopTier
                  ? 'Highest tier reached'
                  : stats.ranksToNextTier > 0
                    ? `${stats.ranksToNextTier} ranks to go`
                    : 'Almost there'
              }
              valueClassName={atTopTier ? 'text-accent-gold' : undefined}
            />
          </div>

          {!atTopTier && (
            <div className="mt-5">
              <div className="flex items-center justify-between gap-2 text-xs mb-2">
                <span className="text-text-muted font-medium">Progress to {stats.nextTierLabel}</span>
                <span className="font-semibold tabular-nums text-text-primary">{stats.tierProgressPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-bg-elevated border border-border-default/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-secondary to-accent-gold transition-all duration-500"
                  style={{ width: `${stats.tierProgressPercent}%` }}
                  role="progressbar"
                  aria-valuenow={stats.tierProgressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progress to ${stats.nextTierLabel}`}
                />
              </div>
              {stats.ranksToNextTier > 0 && (
                <p className="mt-2 text-[11px] text-text-muted flex items-center gap-1.5">
                  {change.positive ? (
                    <ArrowTrendingUpIcon className="h-3.5 w-3.5 text-accent-win shrink-0" aria-hidden="true" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-3.5 w-3.5 text-text-muted shrink-0" aria-hidden="true" />
                  )}
                  Climb {stats.ranksToNextTier} more places to reach {stats.nextTierLabel} tier
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
