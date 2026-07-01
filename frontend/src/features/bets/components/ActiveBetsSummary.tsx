import { formatCredits } from '@/shared/utils/formatCredits'
import type { Bet } from '@/mocks/data/types'
import { cn } from '@/shared/utils/cn'

export function ActiveBetsSummary({ bets }: { bets: Bet[] }) {
  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0)
  const totalPotentialWin = bets.reduce(
    (sum, bet) => sum + (bet.potentialReturn - bet.stake),
    0,
  )

  const items = [
    { label: 'Open positions', value: String(bets.length) },
    { label: 'Total at risk', value: formatCredits(totalStake), mono: true },
    { label: 'Potential win', value: formatCredits(totalPotentialWin), mono: true, accent: true },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border-default/60 bg-bg-elevated/30 px-4 py-3.5"
        >
          <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">
            {item.label}
          </p>
          <p
            className={cn(
              'mt-1 text-xl sm:text-2xl font-bold tabular-nums tracking-tight',
              item.mono && 'font-mono',
              item.accent && 'text-accent-primary',
            )}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}
