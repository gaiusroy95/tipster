import {
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/utils/cn'

export function LeaguesPageHeader({
  total,
  enabled,
  disabled,
  onSync,
  isSyncing,
}: {
  total: number
  enabled: number
  disabled: number
  onSync: () => void
  isSyncing: boolean
}) {
  const stats = [
    {
      label: 'Total leagues',
      value: total,
      caption: 'Imported from Overtime',
      icon: TrophyIcon,
      accent: 'secondary' as const,
    },
    {
      label: 'Live in arena',
      value: enabled,
      caption: 'Visible in app sidebar',
      icon: EyeIcon,
      accent: 'win' as const,
    },
    {
      label: 'Hidden',
      value: disabled,
      caption: 'Disabled from curation',
      icon: EyeSlashIcon,
      accent: 'primary' as const,
    },
  ]

  const accentStyles = {
    secondary: 'border-accent-secondary/25 bg-accent-secondary/10 text-accent-secondary',
    win: 'border-accent-win/25 bg-accent-win/10 text-accent-win',
    primary: 'border-accent-primary/25 bg-accent-primary/10 text-accent-primary',
  }

  return (
    <section className="dashboard-hero relative overflow-hidden rounded-3xl border border-border-default/60 p-5 sm:p-7">
      <div className="dashboard-hero-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-accent-win/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="win">Arena curation</Badge>
            <span className="text-xs text-text-muted">All sports · Overtime API · sidebar order</span>
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Curated leagues
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
              Control which leagues appear in the Tipster Arena sidebar. Sync competitions from
              Overtime across every sport, then enable or hide them for players.
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

        <Button
          size="lg"
          className="w-full lg:w-auto"
          isLoading={isSyncing}
          onClick={onSync}
        >
          <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
          Sync from Overtime
        </Button>
      </div>
    </section>
  )
}
