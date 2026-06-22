import {
  BanknotesIcon,
  CalendarDaysIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { bettingRules } from '@/core/config/bettingRules'
import { formatCredits } from '@/shared/utils/formatCredits'
import { cn } from '@/shared/utils/cn'

const rules = [
  {
    icon: BanknotesIcon,
    label: 'Allowed stakes',
    value: `${formatCredits(bettingRules.standardStake)} / ${formatCredits(bettingRules.premiumStake)}`,
    sub: 'Per bet — 25K or 100K only',
    iconWrap: 'bg-accent-secondary/15 text-accent-secondary border-accent-secondary/25',
  },
  {
    icon: SparklesIcon,
    label: 'Signup bonus',
    value: formatCredits(bettingRules.initialBalance),
    sub: 'Starting virtual credits',
    iconWrap: 'bg-accent-gold/15 text-accent-gold border-accent-gold/25',
  },
  {
    icon: CalendarDaysIcon,
    label: 'Daily bet limit',
    value: String(bettingRules.dailyBetLimit),
    sub: 'Max bets per calendar day',
    iconWrap: 'bg-accent-primary/15 text-accent-primary border-accent-primary/25',
  },
] as const

export function WalletRulesGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {rules.map((rule) => (
        <div
          key={rule.label}
          className="flex items-start gap-3 rounded-xl border border-border-default bg-bg-elevated/40 px-4 py-3.5"
        >
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
              rule.iconWrap,
            )}
          >
            <rule.icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted">
              {rule.label}
            </p>
            <p className="mt-0.5 font-mono text-lg font-bold tabular-nums text-text-primary">
              {rule.value}
            </p>
            <p className="mt-0.5 text-[11px] text-text-muted leading-snug">{rule.sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
