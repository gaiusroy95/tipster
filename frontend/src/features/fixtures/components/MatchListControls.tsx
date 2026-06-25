import type { ReactNode } from 'react'
import { FunnelIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline'
import { Input } from '@/shared/components/ui/Input'
import {
  MATCH_SORT_OPTIONS,
  MATCH_TIME_FILTER_OPTIONS,
  type MatchSortId,
  type MatchTimeFilter,
} from '@/features/fixtures/lib/fixtureListUtils'
import type { League } from '@/mocks/data/types'
import { cn } from '@/shared/utils/cn'

interface MatchListControlsProps {
  search: string
  onSearchChange: (value: string) => void
  sort: MatchSortId
  onSortChange: (value: MatchSortId) => void
  timeFilter: MatchTimeFilter
  onTimeFilterChange: (value: MatchTimeFilter) => void
  showTimeFilter?: boolean
  leagueId?: string
  onLeagueChange: (leagueId?: string) => void
  leagues?: League[]
  leaguesLoading?: boolean
  resultCount?: number
  className?: string
}

function ControlLabel({ icon: Icon, children }: { icon: typeof FunnelIcon; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {children}
    </span>
  )
}

const selectClassName = cn(
  'w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary',
  'min-h-[40px] transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-secondary',
)

const pillClassName = (active: boolean) =>
  cn(
    'rounded-full border px-3 py-1.5 text-xs font-semibold min-h-[36px] whitespace-nowrap transition-colors',
    active
      ? 'border-accent-secondary bg-accent-secondary/15 text-accent-secondary'
      : 'border-border-default text-text-muted hover:border-border-strong hover:text-text-primary',
  )

export function MatchListControls({
  search,
  onSearchChange,
  sort,
  onSortChange,
  timeFilter,
  onTimeFilterChange,
  showTimeFilter = true,
  leagueId,
  onLeagueChange,
  leagues,
  leaguesLoading,
  resultCount,
  className,
}: MatchListControlsProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border-default/60 bg-bg-surface/60 p-3 space-y-3',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ControlLabel icon={FunnelIcon}>Filter & sort</ControlLabel>
        {typeof resultCount === 'number' && (
          <span className="text-xs text-text-muted tabular-nums">
            {resultCount} match{resultCount === 1 ? '' : 'es'}
          </span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="match-search" className="sr-only">
            Search matches
          </label>
          <Input
            id="match-search"
            placeholder="Search team or league…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="min-h-[40px]"
          />
        </div>

        <div className="space-y-1.5">
          <ControlLabel icon={ArrowsUpDownIcon}>Sort by</ControlLabel>
          <select
            id="match-sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as MatchSortId)}
            className={selectClassName}
            aria-label="Sort matches"
          >
            {MATCH_SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <ControlLabel icon={FunnelIcon}>League</ControlLabel>
          <select
            id="match-league"
            value={leagueId ?? ''}
            onChange={(e) => onLeagueChange(e.target.value || undefined)}
            className={selectClassName}
            aria-label="Filter by league"
            disabled={leaguesLoading}
          >
            <option value="">All leagues</option>
            {leagues?.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
                {league.country ? ` (${league.country})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showTimeFilter && (
        <div className="space-y-2">
          <ControlLabel icon={FunnelIcon}>Kickoff</ControlLabel>
          <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {MATCH_TIME_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onTimeFilterChange(opt.id)}
                className={pillClassName(timeFilter === opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
