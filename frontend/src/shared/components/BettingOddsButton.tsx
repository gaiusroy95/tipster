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
  /** Full label for hover tooltip when `label` is abbreviated. */
  labelTitle?: string
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
  labelTitle,
}: BettingOddsButtonProps) {
  const displayOdds =
    marketType === 'malay' ? formatMalayOdds(value) : formatDecimalOdds(value)
  const isDisabled = disabled || value == null || !Number.isFinite(value) || value <= 1

  if (variant === 'stacked') {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border px-3 py-2 min-h-[52px] min-w-[72px] transition-colors',
          selected
            ? 'border-cyan-400/60 bg-cyan-500/10 text-text-primary'
            : 'border-border-default bg-betting-btn hover:border-cyan-400/35 hover:bg-betting-btn-hover',
          isDisabled && 'opacity-50 pointer-events-none',
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
      disabled={isDisabled}
      title={labelTitle ?? label}
      className={cn(
        'flex h-full min-h-[40px] min-w-0 w-full items-center justify-between gap-2 overflow-hidden rounded-md border px-3 py-2 transition-colors',
        selected
          ? 'border-cyan-400/60 bg-cyan-500/10'
          : 'border-betting-btn-border bg-betting-btn hover:border-cyan-400/35 hover:bg-betting-btn-hover',
        isDisabled && 'opacity-50 pointer-events-none',
        className,
      )}
    >
      <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-text-primary">
        {label}
      </span>
      <span className="shrink-0 pl-1 font-mono text-sm font-semibold text-cyan-400">{displayOdds}</span>
    </button>
  )
}
