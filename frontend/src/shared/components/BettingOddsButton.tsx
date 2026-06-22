import { formatDecimalOdds, formatMalayOdds } from '@/shared/utils/formatOdds'
import { cn } from '@/shared/utils/cn'
import type { MarketType } from '@/core/constants/markets'

export type BettingOddsButtonVariant = 'table' | 'stacked'

interface BettingOddsButtonProps {
  label: string
  value: number
  marketType: MarketType
  selected?: boolean
  onClick?: () => void
  className?: string
  variant?: BettingOddsButtonVariant
  disabled?: boolean
}

export function BettingOddsButton({
  label,
  value,
  marketType,
  selected,
  onClick,
  className,
  variant = 'table',
  disabled,
}: BettingOddsButtonProps) {
  const displayOdds =
    marketType === 'malay' ? formatMalayOdds(value) : formatDecimalOdds(value)

  if (variant === 'stacked') {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border px-3 py-2 min-h-[52px] min-w-[72px] transition-colors',
          selected
            ? 'border-cyan-400/60 bg-cyan-500/10 text-text-primary'
            : 'border-border-default bg-betting-btn hover:border-cyan-400/35 hover:bg-betting-btn-hover',
          disabled && 'opacity-50 pointer-events-none',
          className,
        )}
      >
        <span className="text-xs text-text-muted truncate max-w-full">{label}</span>
        <span className="font-mono font-semibold text-sm mt-0.5 text-cyan-400">{displayOdds}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 min-h-[40px] transition-colors',
        selected
          ? 'border-cyan-400/60 bg-cyan-500/10'
          : 'border-betting-btn-border bg-betting-btn hover:border-cyan-400/35 hover:bg-betting-btn-hover',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
    >
      <span className="text-sm font-medium text-text-primary truncate">{label}</span>
      <span className="font-mono text-sm font-semibold text-cyan-400 shrink-0">{displayOdds}</span>
    </button>
  )
}
