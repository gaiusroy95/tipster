import { BettingOddsButton, type BettingOddsButtonVariant } from '@/shared/components/BettingOddsButton'
import type { MarketType } from '@/core/constants/markets'

interface OddsCellProps {
  label: string
  value: number
  marketType: MarketType
  selected?: boolean
  onClick?: () => void
  className?: string
  variant?: BettingOddsButtonVariant
}

export function OddsCell({
  label,
  value,
  marketType,
  selected,
  onClick,
  className,
  variant = 'stacked',
}: OddsCellProps) {
  return (
    <BettingOddsButton
      label={label}
      value={value}
      marketType={marketType}
      selected={selected}
      onClick={onClick}
      className={className}
      variant={variant}
    />
  )
}
