import { ShieldCheckIcon, UserGroupIcon, UserMinusIcon } from '@heroicons/react/24/outline'
import { Badge } from '@/shared/components/Badge'
import { cn } from '@/shared/utils/cn'

export function UsersPageHeader({
  total,
  admins,
  banned,
  loaded,
}: {
  total: number
  admins: number
  banned: number
  loaded: number
}) {
  const stats = [
    {
      label: 'Total users',
      value: total,
      caption: `${loaded} shown in current view`,
      icon: UserGroupIcon,
      accent: 'secondary' as const,
    },
    {
      label: 'Administrators',
      value: admins,
      caption: 'Platform admins in view',
      icon: ShieldCheckIcon,
      accent: 'primary' as const,
    },
    {
      label: 'Banned',
      value: banned,
      caption: 'Suspended accounts in view',
      icon: UserMinusIcon,
      accent: 'loss' as const,
    },
  ]

  const accentStyles = {
    secondary: 'border-accent-secondary/25 bg-accent-secondary/10 text-accent-secondary',
    primary: 'border-accent-primary/25 bg-accent-primary/10 text-accent-primary',
    loss: 'border-accent-loss/25 bg-accent-loss/10 text-accent-loss',
  }

  return (
    <section className="dashboard-hero relative overflow-hidden rounded-3xl border border-border-default/60 p-5 sm:p-7">
      <div className="dashboard-hero-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
      <div className="relative space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">User management</Badge>
          <span className="text-xs text-text-muted">Accounts · roles · moderation · wallet</span>
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Users</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
            Search, filter, and manage every account on Tipster Arena — from role changes and bans
            to balance adjustments and email verification.
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
    </section>
  )
}
