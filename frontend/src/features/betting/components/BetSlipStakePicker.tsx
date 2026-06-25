import { bettingRules, getStakeLabel } from '@/core/config/bettingRules'
import { formatCredits } from '@/shared/utils/formatCredits'
import { cn } from '@/shared/utils/cn'

interface BetSlipStakePickerProps {
  stake: number
  onChange: (stake: number) => void
  className?: string
}

export function BetSlipStakePicker({ stake, onChange, className }: BetSlipStakePickerProps) {
  return (
    <div
      className={cn('inline-flex items-center gap-1', className)}
      role="group"
      aria-label="Stake amount"
    >
      {bettingRules.allowedStakes.map((amount) => {
        const active = stake === amount
        return (
          <button
            key={amount}
            type="button"
            onClick={() => onChange(amount)}
            aria-pressed={active}
            title={formatCredits(amount)}
            className={cn(
              'min-w-[3.25rem] rounded-md px-2.5 py-1.5 text-[11px] font-semibold tracking-wide transition-colors',
              active
                ? 'bg-text-primary text-bg-primary'
                : 'text-text-muted ring-1 ring-inset ring-border-default/80 hover:text-text-primary hover:ring-border-strong',
            )}
          >
            {getStakeLabel(amount)}
          </button>
        )
      })}
    </div>
  )
}
