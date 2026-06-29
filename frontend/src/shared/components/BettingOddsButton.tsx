import { formatMalayOdds } from '@/shared/utils/formatOdds'
import { isValidMalayOdds } from '@/shared/utils/malayOdds'
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
  marketType: _marketType,
  selected,
  onClick,
  className,
  variant = 'table',
  disabled,
  labelTitle,
}: BettingOddsButtonProps) {
  const displayOdds = formatMalayOdds(value)
  const isDisabled = disabled || !isValidMalayOdds(value)

  if (variant === 'stacked') {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        title={labelTitle ?? label}
        className={cn(
          'flex w-full min-w-0 flex-col items-center justify-center gap-0.5 rounded-md border px-2 py-2 min-h-[44px] transition-colors',
          selected
            ? 'border-cyan-400/60 bg-cyan-500/10 text-text-primary'
            : 'border-border-default bg-betting-btn hover:border-cyan-400/35 hover:bg-betting-btn-hover',
          isDisabled && 'opacity-50 pointer-events-none',
          className,
        )}
      >
        <span className="max-w-full truncate text-[11px] text-text-muted">{label}</span>
        <span className="font-mono text-sm font-semibold text-cyan-400">{displayOdds}</span>
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
        'flex h-full min-h-[40px] min-w-0 w-full flex-col items-center justify-center gap-0.5 overflow-hidden rounded-md border px-2 py-1.5 transition-colors',
        selected
          ? 'border-cyan-400/60 bg-cyan-500/10'
          : 'border-betting-btn-border bg-betting-btn hover:border-cyan-400/35 hover:bg-betting-btn-hover',
        isDisabled && 'opacity-50 pointer-events-none',
        className,
      )}
    >
      <span className="max-w-full truncate text-center text-[11px] font-medium text-text-muted">
        {label}
      </span>
      <span className="shrink-0 font-mono text-sm font-semibold text-cyan-400">{displayOdds}</span>
    </button>
  )
}
