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

  const seasonIntro = (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-accent-live">
          Active season
        </span>
      </div>
      <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
        {season.name}
      </h1>
      <p className="mt-1.5 text-sm text-text-muted leading-relaxed max-w-2xl">
        {season.description}
      </p>
    </div>
  )

  const actionLinks = (
    <div className="flex flex-wrap gap-2">
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
  )

  const timelineCard = (
    <div
      className={cn(
        'w-full shrink-0 rounded-xl border border-border-default/60 bg-bg-elevated/50 overflow-hidden',
        !embedded && 'lg:w-[min(100%,340px)]',
      )}
    >
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-border-default/40">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-text-muted">
            <CalendarDaysIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wide">Season timeline</span>
          </div>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-text-primary">
            {progress}%
            <span className="text-sm font-sans font-medium text-text-muted ml-1.5">complete</span>
          </p>
        </div>
        <div className="shrink-0 rounded-lg bg-accent-primary/15 border border-accent-primary/25 px-3 py-2 text-center">
          <p className="font-mono text-xl font-bold tabular-nums text-accent-primary leading-none">
            {daysLeft}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mt-0.5">
            days left
          </p>
        </div>
      </div>

      <div className="px-4 py-3 space-y-2">
        <div className="h-2 rounded-full bg-bg-primary/80 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-secondary to-accent-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Season progress"
          />
        </div>
        <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-text-muted">
          <span>{formatMatchDate(season.startDate)}</span>
          <span className="text-text-muted/50">→</span>
          <span>{formatMatchDate(season.endDate)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        <div className="rounded-lg border border-border-default/50 bg-bg-surface/60 px-3 py-2.5 min-w-0">
          <div className="flex items-center gap-1.5 text-text-muted mb-1">
            <GiftIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-wide">Grand prize</span>
          </div>
          <p className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">
            {topPrize}
          </p>
        </div>
        <div className="rounded-lg border border-border-default/50 bg-bg-surface/60 px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-text-muted mb-1">
            <TrophyIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-wide">Prize tiers</span>
          </div>
          <p className="text-sm font-mono font-bold text-text-primary">
            {season.prizes.length}
            <span className="text-xs font-sans font-medium text-text-muted ml-1">tiers</span>
          </p>
        </div>
      </div>
    </div>
  )

  const innerLayout = embedded ? (
    <div className="flex flex-col gap-4">
      {seasonIntro}
      {timelineCard}
      {actionLinks}
    </div>
  ) : (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
      <div className="min-w-0 flex-1 space-y-3">
        {seasonIntro}
        {actionLinks}
      </div>
      {timelineCard}
    </div>
  )

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
        {innerLayout}
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
