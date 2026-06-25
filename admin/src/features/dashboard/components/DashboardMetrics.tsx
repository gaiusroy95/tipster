import { Link } from 'react-router-dom'
import type { ComponentType, SVGProps } from 'react'
import {
  ArrowUpRightIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { BetSlipNavIcon } from '@/shared/components/icons/BetSlipIcon'
import type { DashboardStats } from '@/features/dashboard/lib/dashboardUtils'
import { cn } from '@/shared/utils/cn'

type MetricAccent = 'secondary' | 'primary' | 'live' | 'win'

type MetricConfig = {
  key: keyof Pick<DashboardStats, 'userCount' | 'activeBets' | 'forumPosts' | 'enabledLeagues'>
  label: string
  caption: string
  to: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  accent: MetricAccent
}

const accentMap: Record<
  MetricAccent,
  { ring: string; icon: string; bar: string; glow: string }
> = {
  secondary: {
    ring: 'group-hover:border-accent-secondary/40',
    icon: 'text-accent-secondary bg-accent-secondary/10 border-accent-secondary/20',
    bar: 'bg-accent-secondary',
    glow: 'from-accent-secondary/20',
  },
  primary: {
    ring: 'group-hover:border-accent-primary/40',
    icon: 'text-accent-primary bg-accent-primary/10 border-accent-primary/20',
    bar: 'bg-accent-primary',
    glow: 'from-accent-primary/20',
  },
  live: {
    ring: 'group-hover:border-accent-live/40',
    icon: 'text-accent-live bg-accent-live/10 border-accent-live/20',
    bar: 'bg-accent-live',
    glow: 'from-accent-live/20',
  },
  win: {
    ring: 'group-hover:border-accent-win/40',
    icon: 'text-accent-win bg-accent-win/10 border-accent-win/20',
    bar: 'bg-accent-win',
    glow: 'from-accent-win/20',
  },
}

const METRICS: MetricConfig[] = [
  {
    key: 'userCount',
    label: 'Users',
    caption: 'Registered accounts across the platform',
    to: '/users',
    icon: UsersIcon,
    accent: 'secondary',
  },
  {
    key: 'activeBets',
    label: 'Active bets',
    caption: 'Open positions in the arena',
    to: '/bets',
    icon: BetSlipNavIcon,
    accent: 'primary',
  },
  {
    key: 'forumPosts',
    label: 'Forum posts',
    caption: 'Published community threads',
    to: '/forum',
    icon: ChatBubbleLeftRightIcon,
    accent: 'live',
  },
  {
    key: 'enabledLeagues',
    label: 'Enabled leagues',
    caption: 'Curated for the arena',
    to: '/leagues',
    icon: TrophyIcon,
    accent: 'win',
  },
]

function MetricCard({
  metric,
  value,
  share,
  featured = false,
  className,
}: {
  metric: MetricConfig
  value: number
  share: number
  featured?: boolean
  className?: string
}) {
  const styles = accentMap[metric.accent]
  const Icon = metric.icon

  return (
    <Link
      to={metric.to}
      className={cn(
        'dashboard-metric group relative overflow-hidden rounded-2xl border border-border-default/70 bg-bg-surface/80 p-5 backdrop-blur-sm transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-glow-accent)]',
        styles.ring,
        featured && 'flex flex-col justify-between lg:min-h-[340px] lg:p-6',
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b to-transparent opacity-70',
          styles.glow,
        )}
        aria-hidden="true"
      />
      <div
        className="dashboard-metric-shine pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl border',
              styles.icon,
              featured && 'h-12 w-12',
            )}
          >
            <Icon className={cn('h-5 w-5', featured && 'h-6 w-6')} aria-hidden="true" />
          </span>
          <ArrowUpRightIcon
            className="h-4 w-4 text-text-muted opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
            aria-hidden="true"
          />
        </div>

        <div className={cn('mt-4', featured && 'mt-auto pt-6')}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            {metric.label}
          </p>
          <p
            className={cn(
              'mt-2 font-display font-bold tabular-nums tracking-tight text-text-primary',
              featured ? 'text-5xl sm:text-6xl' : 'text-3xl',
            )}
          >
            {value}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-text-muted">{metric.caption}</p>
        </div>

        <div className={cn('mt-5', featured && 'mt-6')}>
          <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-wider text-text-muted">
            <span>Share of activity</span>
            <span className="font-mono">{Math.round(share)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-bg-elevated">
            <div
              className={cn('h-full rounded-full transition-all duration-500', styles.bar)}
              style={{ width: `${Math.max(share, 4)}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

function ArenaPulseCard({ stats }: { stats: DashboardStats }) {
  const pulse = stats.userCount + stats.activeBets + stats.forumPosts

  return (
    <div className="relative overflow-hidden rounded-2xl border border-accent-secondary/25 bg-gradient-to-br from-accent-secondary/15 via-bg-surface/90 to-bg-surface p-5">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent-secondary/20 blur-2xl"
        aria-hidden="true"
      />
      <div className="relative">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-accent-secondary/30 bg-accent-secondary/10 text-accent-secondary">
          <BoltIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          Arena pulse
        </p>
        <p className="mt-2 font-display text-3xl font-bold tabular-nums">{pulse}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-text-muted">
          Combined users, bets, and forum signals
        </p>
      </div>
    </div>
  )
}

export function DashboardMetrics({ stats }: { stats: DashboardStats }) {
  const total =
    stats.userCount + stats.activeBets + stats.forumPosts + stats.enabledLeagues || 1
  const [featured, ...rest] = METRICS

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <MetricCard
        metric={featured}
        value={stats[featured.key]}
        share={(stats[featured.key] / total) * 100}
        featured
        className="lg:col-span-5"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-2">
        {rest.map((metric) => (
          <MetricCard
            key={metric.key}
            metric={metric}
            value={stats[metric.key]}
            share={(stats[metric.key] / total) * 100}
          />
        ))}
        <ArenaPulseCard stats={stats} />
      </div>
    </div>
  )
}

export function DashboardMetricsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <div className="h-72 animate-pulse rounded-2xl bg-bg-elevated/70 lg:col-span-5 lg:min-h-[340px]" />
      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-bg-elevated/70" />
        ))}
      </div>
    </div>
  )
}
