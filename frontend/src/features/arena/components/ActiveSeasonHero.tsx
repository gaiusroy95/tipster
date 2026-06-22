import { Link } from 'react-router-dom'
import { TrophyIcon, CalendarDaysIcon, GiftIcon } from '@heroicons/react/24/outline'
import type { Season } from '@/mocks/data/types'
import { ROUTES } from '@/core/constants/routes'
import { formatMatchDate } from '@/shared/utils/formatDate'
import {
  getDaysRemaining,
  getSeasonProgress,
} from '@/shared/utils/seasonProgress'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { cn } from '@/shared/utils/cn'

interface ActiveSeasonHeroProps {
  season?: Season
  isLoading?: boolean
  variant?: 'standalone' | 'embedded'
}

export function ActiveSeasonHero({
  season,
  isLoading,
  variant = 'standalone',
}: ActiveSeasonHeroProps) {
  const embedded = variant === 'embedded'

  if (isLoading) {
    return (
      <div className={cn(embedded ? 'px-4 py-5 sm:px-6' : 'mb-6 rounded-2xl border border-border-default/60 p-4')}>
        <Skeleton className={cn(embedded ? 'h-36' : 'h-[200px]', 'w-full rounded-xl')} />
      </div>
    )
  }

  if (!season) {
    return (
      <div
        className={cn(
          embedded ? 'px-4 py-8 sm:px-6 text-center' : 'mb-6 rounded-2xl border border-border-default bg-bg-surface px-6 py-8 text-center',
        )}
      >
        <p className="text-text-muted text-sm">No active season at the moment.</p>
      </div>
    )
  }

  const progress = getSeasonProgress(season.startDate, season.endDate)
  const daysLeft = getDaysRemaining(season.endDate)
  const topPrize = season.prizes[0]?.name ?? 'Champion rewards'

  const content = (
    <div
      className={cn(
        embedded
          ? 'px-4 py-5 sm:px-6 lg:py-5'
          : 'relative overflow-hidden rounded-2xl border border-border-default shadow-card',
      )}
    >
      {!embedded && (
        <>
          <div className="absolute inset-0 bg-bg-surface" aria-hidden="true" />
          <div
            className="absolute inset-0 bg-gradient-to-br from-accent-secondary/18 via-bg-surface to-accent-primary/12"
            aria-hidden="true"
          />
          <div
            className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent-secondary/20 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-accent-primary/12 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-secondary/50 to-transparent"
            aria-hidden="true"
          />
        </>
      )}

      <div className={cn(!embedded && 'relative px-5 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7')}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-accent-live">
                Active season
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
              {season.name}
            </h1>
            <p className="mt-1.5 text-sm text-text-muted leading-relaxed line-clamp-2 lg:line-clamp-none max-w-2xl">
              {season.description}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                to={ROUTES.SEASONS}
                className="inline-flex items-center gap-2 rounded-md border border-border-default px-3 py-2 text-sm font-medium text-text-primary hover:bg-bg-elevated transition-colors min-h-[40px]"
              >
                <GiftIcon className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
                Prizes
              </Link>
              <Link
                to={`${ROUTES.HOME}?tab=leaderboard`}
                className="inline-flex items-center gap-2 rounded-md border border-border-default px-3 py-2 text-sm font-medium text-text-primary hover:bg-bg-elevated transition-colors min-h-[40px]"
              >
                <TrophyIcon className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
                Leaderboard
              </Link>
            </div>
          </div>

          <div
            className="w-full lg:w-[min(100%,280px)] shrink-0 border border-border-default bg-bg-elevated/40 p-4"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="flex items-center gap-1.5 text-xs text-text-muted">
                <CalendarDaysIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                Progress
              </span>
              <span className="text-xs font-mono text-text-primary">{progress}%</span>
            </div>

            <div className="h-1.5 rounded-full bg-bg-primary overflow-hidden">
              <div
                className="h-full rounded-full bg-accent-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Season progress"
              />
            </div>

            <div className="mt-2 flex items-center justify-between gap-2 text-xs font-mono text-text-muted">
              <span>{formatMatchDate(season.startDate)}</span>
              <span className="text-text-primary font-semibold shrink-0">{daysLeft} days left</span>
              <span>{formatMatchDate(season.endDate)}</span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border-default pt-3">
              <div className="min-w-0">
                <p className="text-xs text-text-muted">Grand prize</p>
                <p className="mt-0.5 text-sm font-medium truncate">{topPrize}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Prize tiers</p>
                <p className="mt-0.5 text-sm font-mono font-medium">{season.prizes.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (embedded) {
    return content
  }

  return (
    <section className="mb-6" aria-label="Active season">
      {content}
    </section>
  )
}

interface ActiveSeasonSidebarCardProps {
  season?: Season
  isLoading?: boolean
}

export function ActiveSeasonSidebarCard({ season, isLoading }: ActiveSeasonSidebarCardProps) {
  if (isLoading) {
    return (
      <section className="glass-panel rounded-2xl p-4">
        <Skeleton className="h-24 w-full" />
      </section>
    )
  }

  if (!season) {
    return (
      <section className="glass-panel rounded-2xl p-4">
        <p className="text-sm text-text-muted">No active season</p>
      </section>
    )
  }

  const progress = getSeasonProgress(season.startDate, season.endDate)
  const daysLeft = getDaysRemaining(season.endDate)

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border-default/70 bg-bg-surface/90 p-4">
      <div
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent-secondary/15 blur-2xl"
        aria-hidden="true"
      />
      <div className="relative">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wide text-accent-primary">
            Active season
          </span>
          <span className="text-xs font-mono font-semibold text-accent-live">{daysLeft}d left</span>
        </div>
        <h2 className="font-display text-lg font-bold leading-tight">{season.name}</h2>
        <div className="mt-3 h-1 rounded-full bg-bg-elevated overflow-hidden">
          <div
            className={cn('h-full rounded-full bg-gradient-to-r from-accent-secondary to-accent-primary')}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-text-muted font-mono">
          {formatMatchDate(season.startDate)} — {formatMatchDate(season.endDate)}
        </p>
        <Link
          to={ROUTES.SEASONS}
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent-secondary hover:text-accent-primary transition-colors min-h-[44px]"
        >
          Prize tiers & rules →
        </Link>
      </div>
    </section>
  )
}
