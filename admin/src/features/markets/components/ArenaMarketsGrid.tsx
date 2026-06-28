import { EnableToggle } from '@/features/leagues/components/EnableToggle'
import {
  ARENA_MARKET_META,
  type MarketTypeConfig,
} from '@/features/markets/lib/marketUtils'
import { Badge } from '@/shared/components/Badge'
import { PanelCard } from '@/shared/components/PanelCard'
import { Skeleton } from '@/shared/components/ui/Card'
import { cn } from '@/shared/utils/cn'

const accentStyles = {
  win: 'border-accent-win/30 bg-accent-win/10 text-accent-win',
  secondary: 'border-accent-secondary/30 bg-accent-secondary/10 text-accent-secondary',
  primary: 'border-accent-primary/30 bg-accent-primary/10 text-accent-primary',
}

export function ArenaMarketsGrid({
  markets,
  isLoading,
  togglingId,
  onToggle,
}: {
  markets: MarketTypeConfig[]
  isLoading: boolean
  togglingId: string | null
  onToggle: (market: MarketTypeConfig, isEnabled: boolean) => void
}) {
  return (
    <PanelCard
      title="Arena display controls"
      subtitle="These four toggles control what players see on fixture cards and match pages"
    >
      {isLoading && !markets.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {markets.map((market) => {
            const meta = ARENA_MARKET_META[market.marketType]
            const Icon = meta?.icon
            const accent = meta?.accent ?? 'secondary'

            return (
              <article
                key={market.id}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border transition-colors',
                  market.isEnabled
                    ? 'border-accent-win/25 bg-bg-primary/30'
                    : 'border-border-default/70 bg-bg-elevated/20',
                )}
              >
                <div
                  className={cn(
                    'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80',
                    meta?.surface ?? 'from-bg-elevated/40 to-transparent',
                  )}
                  aria-hidden="true"
                />

                <div className="relative flex h-full flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {Icon ? (
                        <span
                          className={cn(
                            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border',
                            accentStyles[accent],
                          )}
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-base font-bold text-text-primary">
                            {market.label}
                          </h3>
                          {meta?.shortLabel ? (
                            <Badge variant={market.isEnabled ? 'win' : 'default'}>
                              {meta.shortLabel}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-text-muted">
                          {market.description ?? meta?.hint ?? 'Odds market category'}
                        </p>
                      </div>
                    </div>
                    <EnableToggle
                      enabled={market.isEnabled}
                      disabled={togglingId === market.id}
                      label={market.isEnabled ? `Disable ${market.label}` : `Enable ${market.label}`}
                      onChange={(isEnabled) => onToggle(market, isEnabled)}
                    />
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-border-default/50 pt-3">
                    <code className="rounded-md bg-bg-primary/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                      {market.marketType}
                    </code>
                    <span
                      className={cn(
                        'text-[11px] font-semibold uppercase tracking-wide',
                        market.isEnabled ? 'text-accent-win' : 'text-text-muted',
                      )}
                    >
                      {market.isEnabled ? 'Visible in arena' : 'Hidden from players'}
                    </span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </PanelCard>
  )
}
