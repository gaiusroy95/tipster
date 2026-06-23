import { MARKET_TYPES, type MarketType } from '@/core/constants/markets'

export function formatMalayOdds(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—'
  if (value === 0) return '0.00'
  if (value > 0) return `+${value.toFixed(2)}`
  return value.toFixed(2)
}

export function formatHandicap(value: number): string {
  if (value === 0) return '0'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value}`
}

export function formatDecimalOdds(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return value.toFixed(2)
}

export function formatSelectionLabel(
  marketType: MarketType,
  label: string,
  handicap?: number,
  line?: number,
): string {
  if (marketType === MARKET_TYPES.HANDICAP && handicap !== undefined) {
    return formatHandicap(handicap)
  }
  if (marketType === MARKET_TYPES.OVER_UNDER && line !== undefined) {
    const isOver = label.toLowerCase().includes('over')
    return `${isOver ? 'Over' : 'Under'} ${line}`
  }
  return label
}
