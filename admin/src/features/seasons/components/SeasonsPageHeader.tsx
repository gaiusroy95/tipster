import {
  CalendarDaysIcon,
  PlusIcon,
  SparklesIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'
import { formatSeasonDates } from '@/features/seasons/lib/seasonUtils'
import { SeasonProgressRing } from '@/features/seasons/components/SeasonProgressRing'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/utils/cn'

export function SeasonsPageHeader({
  total,
  prizeTiers,
  upcoming,
  activeName,
  activeDates,
  progress,
  daysLeft,
  onCreateClick,
}: {
  total: number
  prizeTiers: number
  upcoming: number
  activeName: string | null
  activeDates: { start: string; end: string } | null
  progress: number | null
  daysLeft: number | null
  onCreateClick: () => void
}) {
  const stats = [
    {
      label: 'Total seasons',
      value: total,
      caption: 'Competition cycles in catalog',
      icon: CalendarDaysIcon,
      accent: 'secondary' as const,
    },
    {
      label: 'Prize tiers',
      value: prizeTiers,
      caption: 'Rewards configured across seasons',
      icon: SparklesIcon,
      accent: 'primary' as const,
    },
    {
      label: 'Upcoming',
      value: upcoming,
      caption: 'Draft seasons ready to launch',
      icon: TrophyIcon,
      accent: 'win' as const,
    },
  ]

  const accentStyles = {
    secondary: 'border-accent-secondary/25 bg-accent-secondary/10 text-accent-secondary',
    primary: 'border-accent-primary/25 bg-accent-primary/10 text-accent-primary',
    win: 'border-accent-win/25 bg-accent-win/10 text-accent-win',
  }

  return (
    <section className="dashboard-hero relative overflow-hidden rounded-3xl border border-border-default/60 p-5 sm:p-7">
      <div className="dashboard-hero-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-accent-primary/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-accent-win/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative grid gap-6 xl:grid-cols-[1fr_auto] xl:items-end">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">Season control</Badge>
            {activeName ? (
              <span className="dashboard-live-pill inline-flex items-center gap-2 rounded-full border border-accent-win/30 bg-accent-win/10 px-3 py-1 text-xs font-semibold text-accent-win">
                <span className="dashboard-live-dot h-2 w-2 rounded-full bg-accent-win" aria-hidden="true" />
                {activeName} is live
              </span>
            ) : (
              <Badge>No active season</Badge>
            )}
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Competition seasons
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
              Orchestrate Tipster Arena&apos;s competitive calendar — launch seasons, define prize
              tiers, and control which leaderboard cycle players compete in.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border-default/70 bg-bg-primary/40 p-4 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                      {stat.label}
                    </p>
                    <p className="mt-1 font-display text-2xl font-bold tabular-nums">{stat.value}</p>
                    <p className="mt-1 text-xs text-text-muted">{stat.caption}</p>
                  </div>
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
                      accentStyles[stat.accent],
                    )}
                  >
                    <stat.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row xl:flex-col xl:items-stretch">
          {activeName && activeDates && progress !== null ? (
            <div className="relative overflow-hidden rounded-2xl border border-accent-win/20 bg-gradient-to-br from-accent-win/10 via-bg-primary/50 to-bg-primary/40 p-5 backdrop-blur-sm sm:min-w-[280px] xl:w-[300px]">
              <div
                className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent-win/20 blur-2xl"
                aria-hidden="true"
              />
              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-win">
                    Live season
                  </p>
                  <p className="mt-1 truncate font-display text-lg font-bold">{activeName}</p>
                  <p className="mt-2 text-xs leading-relaxed text-text-muted">
                    {formatSeasonDates(activeDates.start, activeDates.end)}
                  </p>
                  {daysLeft !== null ? (
                    <p className="mt-2 text-sm font-semibold text-accent-primary">
                      {daysLeft} day{daysLeft === 1 ? '' : 's'} remaining
                    </p>
                  ) : null}
                </div>
                <SeasonProgressRing progress={progress} size="md" icon={TrophyIcon} />
              </div>
              <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-border-default/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-win to-accent-primary transition-all duration-700"
                  style={{ width: `${Math.round(progress)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border-default/80 bg-bg-primary/30 p-5 sm:min-w-[280px] xl:w-[300px]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                No live season
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Activate an upcoming season to start tracking leaderboard progress and prize payouts.
              </p>
            </div>
          )}

          <Button size="lg" className="w-full xl:w-[300px]" onClick={onCreateClick}>
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Create season
          </Button>
        </div>
      </div>
    </section>
  )
}
