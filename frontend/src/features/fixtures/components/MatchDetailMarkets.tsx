import { Link } from 'react-router-dom'
import { TicketIcon } from '@heroicons/react/24/outline'
import { BettingOddsButton } from '@/shared/components/BettingOddsButton'
import { Button } from '@/shared/components/ui/Button'
import { ROUTES } from '@/core/constants/routes'
import { MARKET_TYPES, type MarketType } from '@/core/constants/markets'
import { getEnabledMarketTypes } from '@/features/fixtures/lib/enabledMarketTypes'
import { formatSelectionLabel } from '@/shared/utils/formatOdds'
import type { MatchWithTeams } from '@/features/fixtures/types/fixture'
import type { MarketOdds } from '@/mocks/data/types'
import { cn } from '@/shared/utils/cn'

const MARKET_TAB_ORDER: MarketType[] = [
  MARKET_TYPES.WINNER,
  MARKET_TYPES.MALAY,
  MARKET_TYPES.HANDICAP,
  MARKET_TYPES.OVER_UNDER,
]

const MARKET_LABELS: Record<MarketType, { label: string; shortLabel: string }> = {
  [MARKET_TYPES.WINNER]: { label: 'Winner', shortLabel: 'Win' },
  [MARKET_TYPES.MALAY]: { label: 'Malay', shortLabel: 'Malay' },
  [MARKET_TYPES.HANDICAP]: { label: 'Handicap', shortLabel: 'HCP' },
  [MARKET_TYPES.OVER_UNDER]: { label: 'Over/Under', shortLabel: 'O/U' },
}

interface MatchDetailMarketsProps {
  match: MatchWithTeams
  activeMarket: MarketType
  onMarketChange: (market: MarketType) => void
  canBet: boolean
  selectedSelectionIds: Set<string>
  slipCount: number
  onSelect: (selectionId: string, label: string, value: number) => void
}

export function getAvailableMarketTabs(markets: MarketOdds[]) {
  const enabled = new Set(getEnabledMarketTypes())
  return MARKET_TAB_ORDER.filter(
    (type) => enabled.has(type) && markets.some((m) => m.marketType === type),
  )
}

export function MatchDetailMarkets({
  match,
  activeMarket,
  onMarketChange,
  canBet,
  selectedSelectionIds,
  slipCount,
  onSelect,
}: MatchDetailMarketsProps) {
  const availableTabs = getAvailableMarketTabs(match.markets)
  const market = match.markets.find((m) => m.marketType === activeMarket)

  if (!availableTabs.length) {
    return (
      <section className="rounded-2xl border border-border-default bg-bg-surface p-6 text-center">
        <p className="text-sm text-text-muted">No markets available for this match.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-border-default bg-bg-surface overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-border-default/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="font-display text-base font-semibold text-text-primary">Markets</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            {canBet ? 'Tap a selection to add it to your bet slip' : 'Betting is closed for this match'}
          </p>
        </div>
        {slipCount > 0 && (
          <Link to={ROUTES.BET_SLIP} className="shrink-0">
            <Button variant="secondary" size="sm" className="gap-2">
              <TicketIcon className="h-4 w-4" aria-hidden="true" />
              Bet slip
              <span className="rounded-full bg-accent-secondary/20 px-2 py-0.5 text-xs font-bold text-accent-secondary">
                {slipCount}
              </span>
            </Button>
          </Link>
        )}
      </div>

      <div className="border-b border-border-default/60 px-4 sm:px-6">
        <div
          className="flex gap-6 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
        >
          {availableTabs.map((type) => {
            const meta = MARKET_LABELS[type]
            const isActive = activeMarket === type
            return (
              <button
                key={type}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onMarketChange(type)}
                className={cn(
                  'relative shrink-0 py-3 text-sm font-medium transition-colors min-h-[44px]',
                  isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-primary',
                )}
              >
                <span className="sm:hidden">{meta.shortLabel}</span>
                <span className="hidden sm:inline">{meta.label}</span>
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-accent-secondary"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-4 sm:p-6" role="tabpanel">
        {market ? (
          <div className="mx-auto max-w-2xl">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-text-muted">
              {MARKET_LABELS[activeMarket].label}
            </p>
            <div
              className={cn(
                'grid gap-1',
                market.selections.length >= 3 ? 'grid-rows-3' : 'grid-rows-2',
              )}
            >
              {market.selections.map((sel) => {
                const displayLabel = formatSelectionLabel(
                  activeMarket,
                  sel.label,
                  sel.handicap,
                  sel.line,
                )
                const selected = selectedSelectionIds.has(sel.id)
                return (
                  <BettingOddsButton
                    key={sel.id}
                    label={displayLabel}
                    value={sel.value}
                    marketType={activeMarket}
                    selected={selected}
                    disabled={!canBet}
                    onClick={() => onSelect(sel.id, sel.label, sel.value)}
                    className="min-h-[48px]"
                  />
                )
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-muted">No odds for this market.</p>
        )}
      </div>
    </section>
  )
}
