import { Link } from 'react-router-dom'
import { ArrowLeftIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'
import { LiveBadge } from '@/shared/components/LiveBadge'
import { LeagueLogo } from '@/shared/components/LeagueLogo'
import { TeamCountryBadge } from '@/shared/components/TeamCountryBadge'
import { ROUTES } from '@/core/constants/routes'
import { formatMatchDate, formatMatchTime } from '@/shared/utils/formatDate'
import type { MatchWithTeams } from '@/features/fixtures/types/fixture'

interface MatchDetailHeroProps {
  match: MatchWithTeams
}

export function MatchDetailHero({ match }: MatchDetailHeroProps) {
  const isLive = match.status === 'live'
  const hasScore = match.status === 'live' || match.status === 'finished'
  const scoreDisplay = hasScore
    ? `${match.homeScore ?? 0} : ${match.awayScore ?? 0}`
    : null

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border-default bg-bg-surface">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-secondary/10 via-transparent to-accent-primary/5"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent-secondary/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative px-4 py-4 sm:px-6 sm:py-5">
        <Link
          to={`${ROUTES.HOME}?tab=cup`}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeftIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          Back to matches
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <LeagueLogo
                name={match.league.name}
                country={match.league.country}
                logoUrl={match.league.logoUrl}
                size="xs"
                className="h-5 w-5 rounded-md"
              />
              <span className="truncate">{match.league.name}</span>
            </span>
            <span className="hidden text-border-strong sm:inline" aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDaysIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{formatMatchDate(match.startTime)}</span>
              <span className="font-mono font-semibold text-text-primary">
                {formatMatchTime(match.startTime)}
              </span>
            </span>
          </div>
          <LiveBadge status={match.status} minute={match.minute} />
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
          <div className="flex flex-col items-center gap-3 text-center sm:items-end sm:text-right">
            <TeamCountryBadge
              teamName={match.homeTeam.name}
              shortName={match.homeTeam.shortName}
              logoUrl={match.homeTeam.logoUrl}
              side="home"
              size="lg"
              className="shadow-card"
            />
            <div className="min-w-0 max-w-full">
              <p className="font-display text-base font-bold leading-tight sm:text-lg">
                {match.homeTeam.name}
              </p>
              <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-text-muted">
                Home
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center px-2 sm:px-4">
            {scoreDisplay ? (
              <p className="font-mono text-3xl font-bold tracking-widest text-text-primary sm:text-4xl">
                {scoreDisplay}
              </p>
            ) : (
              <>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
                  Starts
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-text-primary sm:text-3xl">
                  {formatMatchTime(match.startTime)}
                </p>
              </>
            )}
            {isLive && (
              <span className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-accent-live">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-live" />
                Live
              </span>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
            <TeamCountryBadge
              teamName={match.awayTeam.name}
              shortName={match.awayTeam.shortName}
              logoUrl={match.awayTeam.logoUrl}
              side="away"
              size="lg"
              className="shadow-card"
            />
            <div className="min-w-0 max-w-full">
              <p className="font-display text-base font-bold leading-tight sm:text-lg">
                {match.awayTeam.name}
              </p>
              <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-text-muted">
                Away
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
