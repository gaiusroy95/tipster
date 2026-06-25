import type { BetSelection } from '@/features/betting/stores/betSlipStore'
import { formatMalayOdds, formatDecimalOdds } from '@/shared/utils/formatOdds'

export function calcBetReturn(stake: number, odds: number, marketType: string): number {
  if (marketType === 'malay') {
    if (odds > 0) return Math.round(stake + stake * odds)
    return Math.round(stake + stake)
  }
  return Math.round(stake * (odds > 0 ? odds : 2))
}

export function betSlipMarketLabel(marketType: BetSelection['marketType']): string {
  switch (marketType) {
    case 'over_under':
      return 'Over/Under'
    case 'handicap':
      return 'Handicap'
    case 'winner':
      return 'Winner'
    case 'malay':
      return 'Malay'
    default:
      return String(marketType).replace('_', '/')
  }
}

export function formatBetSlipOdds(sel: BetSelection): string {
  return sel.marketType === 'malay' ? formatMalayOdds(sel.odds) : formatDecimalOdds(sel.odds)
}
