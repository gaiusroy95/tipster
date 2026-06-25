import {
  ArrowTrendingUpIcon,
  BoltIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { BetSlipNavIcon } from '@/shared/components/icons/BetSlipIcon'
import { BET_STATUS_FILTERS, formatStake, type BetStatusFilter } from '@/features/bets/lib/betUtils'
import { Input } from '@/shared/components/ui/Input'
import { cn } from '@/shared/utils/cn'

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
  const metrics = [
    {
      label: 'In feed',
      value: loaded,
      suffix: `of ${total}`,
      icon: BetSlipNavIcon,
      tone: 'text-accent-secondary',
    },
    {
      label: 'Live slips',
      value: active,
      icon: BoltIcon,
      tone: 'text-accent-win',
      pulse: active > 0,
    },
    {
      label: 'Stake volume',
      value: formatStake(volume),
      icon: CurrencyDollarIcon,
      tone: 'text-accent-primary',
    },
    {
      label: 'Live exposure',
      value: formatStake(exposure),
      icon: ArrowTrendingUpIcon,
      tone: 'text-amber-400',
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
              placeholder="Search match, selection, or tipster…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="border-border-default/80 bg-bg-primary/60 pl-10 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      <div className="relative flex gap-3 overflow-x-auto px-4 py-4 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex min-w-[140px] shrink-0 flex-col rounded-2xl border border-border-default/60 bg-bg-primary/50 px-4 py-3 backdrop-blur-sm sm:min-w-[160px]"
          >
            <div className="flex items-center gap-2">
              <metric.icon className={cn('h-4 w-4', metric.tone)} aria-hidden="true" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                {metric.label}
              </span>
              {metric.pulse ? (
                <span className="ml-auto h-2 w-2 rounded-full bg-accent-win animate-pulse" aria-hidden="true" />
              ) : null}
            </div>
            <p className="mt-2 font-display text-2xl font-bold tabular-nums">
              {metric.value}
              {'suffix' in metric && metric.suffix ? (
                <span className="ml-1 text-sm font-medium text-text-muted">{metric.suffix}</span>
              ) : null}
            </p>
          </div>
        ))}
        <div className="flex min-w-[120px] shrink-0 flex-col justify-center rounded-2xl border border-dashed border-accent-primary/30 bg-accent-primary/5 px-4 py-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            Avg odds
          </span>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-accent-primary">
            {avgOdds > 0 ? avgOdds.toFixed(2) : '—'}
          </p>
        </div>
      </div>

      <div className="relative flex gap-2 overflow-x-auto border-t border-border-default/40 px-4 py-3 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {BET_STATUS_FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onStatusChange(item.id)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all',
              status === item.id
                ? 'border-accent-primary/40 bg-accent-primary/15 text-text-primary shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                : 'border-border-default/70 bg-bg-primary/30 text-text-muted hover:border-border-strong hover:text-text-primary',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  )
}
