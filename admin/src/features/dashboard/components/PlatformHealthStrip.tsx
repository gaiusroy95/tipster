import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import type { DashboardStats } from '@/features/dashboard/lib/dashboardUtils'
import { cn } from '@/shared/utils/cn'

export function PlatformHealthStrip({ stats }: { stats: DashboardStats }) {
  const checks = [
    {
      label: stats.activeSeason ? 'Season live' : 'No active season',
      detail: stats.activeSeason?.name ?? 'Configure a season to go live',
      ok: !!stats.activeSeason,
      icon: SparklesIcon,
    },
    {
      label: 'League coverage',
      detail:
        stats.enabledLeagues > 0
          ? `${stats.enabledLeagues} league${stats.enabledLeagues === 1 ? '' : 's'} enabled`
          : 'No leagues enabled yet',
      ok: stats.enabledLeagues > 0,
      icon: CheckCircleIcon,
    },
    {
      label: 'Community activity',
      detail:
        stats.forumPosts > 0
          ? `${stats.forumPosts} published post${stats.forumPosts === 1 ? '' : 's'}`
          : 'Forum awaiting first posts',
      ok: stats.forumPosts > 0,
      icon: ShieldCheckIcon,
    },
    {
      label: 'Arena engagement',
      detail:
        stats.activeBets > 0
          ? `${stats.activeBets} open bet${stats.activeBets === 1 ? '' : 's'} in play`
          : 'No open bets right now',
      ok: stats.activeBets > 0,
      icon: stats.activeBets > 0 ? CheckCircleIcon : ExclamationTriangleIcon,
    },
  ]

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {checks.map((check) => (
        <div
          key={check.label}
          className={cn(
            'rounded-2xl border p-4 transition-colors',
            check.ok
              ? 'border-border-default/70 bg-bg-surface/60'
              : 'border-accent-primary/20 bg-accent-primary/5',
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
                check.ok
                  ? 'border-accent-win/25 bg-accent-win/10 text-accent-win'
                  : 'border-accent-primary/25 bg-accent-primary/10 text-accent-primary',
              )}
            >
              <check.icon className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{check.label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{check.detail}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
