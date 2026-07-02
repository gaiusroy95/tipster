import type { ComponentType, SVGProps } from 'react'
import {
  ArrowTrendingUpIcon,
  BoltIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { BetSlipNavIcon } from '@/shared/components/icons/BetSlipIcon'
import { BET_STATUS_FILTERS, formatStake, type BetStatusFilter } from '@/features/bets/lib/betUtils'
import { Input } from '@/shared/components/ui/Input'
import { cn } from '@/shared/utils/cn'

type MetricConfig = {
  label: string
  value: string | number
  suffix?: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  tone: string
  iconWrap: string
  pulse?: boolean
  dashed?: boolean
}

function MetricTile({
  metric,
  className,
}: {
  metric: MetricConfig
  className?: string
}) {
  const Icon = metric.icon

  return (
    <div
      className={cn(
        'bet-metric-tile flex min-w-0 flex-col rounded-2xl border p-3.5 backdrop-blur-sm sm:p-4',
        metric.dashed
          ? 'border-dashed border-accent-primary/30 bg-accent-primary/5'
          : 'border-border-default/60 bg-bg-primary/55',
        className,
      )}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border',
            metric.iconWrap,
          )}
        >
          <Icon className={cn('h-4 w-4', metric.tone)} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase leading-tight tracking-[0.08em] text-text-muted">
            {metric.label}
          </span>
          <p
            className={cn(
              'mt-1.5 font-display text-xl font-bold tabular-nums sm:text-2xl',
              metric.dashed && 'font-mono text-accent-primary',
            )}
          >
            {metric.value}
            {metric.suffix ? (
              <span className="ml-1 text-sm font-medium text-text-muted">{metric.suffix}</span>
            ) : null}
          </p>
        </div>
        {metric.pulse ? (
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent-win animate-pulse" aria-hidden="true" />
        ) : null}
      </div>
    </div>
  )
}

export function BetsCommandBar({
  total,
  loaded,
  active,
  volume,
  exposure,
  avgOdds,
  search,
  onSearchChange,
  status,
  onStatusChange,
}: {
  total: number
  loaded: number
  active: number
  volume: number
  exposure: number
  avgOdds: number
  search: string
  onSearchChange: (value: string) => void
  status: BetStatusFilter
  onStatusChange: (status: BetStatusFilter) => void
}) {
  const metrics: MetricConfig[] = [
    {
      label: 'In feed',
      value: loaded,
      suffix: `of ${total}`,
      icon: BetSlipNavIcon,
      tone: 'text-accent-secondary',
      iconWrap: 'border-accent-secondary/25 bg-accent-secondary/10',
    },
    {
      label: 'Live slips',
      value: active,
      icon: BoltIcon,
      tone: 'text-accent-win',
      iconWrap: 'border-accent-win/25 bg-accent-win/10',
      pulse: active > 0,
    },
    {
      label: 'Stake volume',
      value: formatStake(volume),
      icon: CurrencyDollarIcon,
      tone: 'text-accent-primary',
      iconWrap: 'border-accent-primary/25 bg-accent-primary/10',
    },
    {
      label: 'Live exposure',
      value: formatStake(exposure),
      icon: ArrowTrendingUpIcon,
      tone: 'text-amber-400',
      iconWrap: 'border-amber-400/25 bg-amber-400/10',
    },
    {
      label: 'Avg odds',
      value: avgOdds > 0 ? avgOdds.toFixed(2) : '—',
      icon: ChartBarIcon,
      tone: 'text-accent-primary',
      iconWrap: 'border-accent-primary/25 bg-accent-primary/10',
      dashed: true,
    },
  ]

  return (
    <section className="bet-command-deck relative overflow-hidden rounded-3xl border border-border-default/60">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(99,102,241,0.12)_0%,transparent_45%,rgba(245,158,11,0.08)_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 top-0 h-40 w-40 rounded-full bg-accent-win/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative border-b border-border-default/50 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent-win/25 bg-accent-win/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-accent-win">
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full bg-accent-win',
                    active > 0 && 'animate-pulse',
                  )}
                  aria-hidden="true"
                />
                Slip stream
              </span>
              <span className="text-xs text-text-muted">Real-time arena wager monitor</span>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Bet monitor
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-text-muted">
              Track every wager across the platform — filter by outcome, inspect exposure, and
              void slips when moderation is required.
            </p>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            />
            <Input
              placeholder="Search ticket, @username, match, or selection…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="border-border-default/80 bg-bg-primary/60 pl-10 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      <div className="relative border-b border-border-default/40 px-4 py-4 sm:px-6 sm:py-5">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
          At a glance
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:flex xl:gap-3 xl:overflow-x-auto xl:pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {metrics.map((metric) => (
            <MetricTile
              key={metric.label}
              metric={metric}
              className={cn(
                metric.label === 'Avg odds' && 'col-span-2 sm:col-span-1',
                'xl:min-w-[11.5rem] xl:shrink-0',
              )}
            />
          ))}
        </div>
      </div>

      <div className="relative px-4 py-4 sm:px-6 sm:py-5">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
          Filter slips
        </p>
        <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div
            className="inline-flex min-w-full gap-1.5 rounded-2xl border border-border-default/60 bg-bg-primary/45 p-1.5 sm:gap-2 sm:p-2"
            role="tablist"
            aria-label="Filter by bet status"
          >
            {BET_STATUS_FILTERS.map((item) => {
              const activeFilter = status === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter}
                  onClick={() => onStatusChange(item.id)}
                  className={cn(
                    'shrink-0 rounded-xl px-3.5 py-2 text-[11px] font-bold uppercase tracking-wide transition-all sm:px-4',
                    activeFilter
                      ? 'bg-gradient-to-r from-accent-primary/20 to-accent-secondary/15 text-text-primary shadow-[inset_0_0_0_1px_rgba(245,158,11,0.35)]'
                      : 'text-text-muted hover:bg-bg-elevated/70 hover:text-text-primary',
                  )}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
