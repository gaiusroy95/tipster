import type { BetSelection } from '@/features/betting/stores/betSlipStore'
import { MATCH_STATUS, type MatchStatus } from '@/core/constants/markets'
import { formatMalayOdds } from '@/shared/utils/formatOdds'
import { malayReturn, usesMalayOddsFormat } from '@/shared/utils/malayOdds'

const BETTABLE_STATUSES = new Set<MatchStatus>([MATCH_STATUS.SCHEDULED, MATCH_STATUS.LIVE])

export function isMatchBettable(status: MatchStatus | null | undefined): boolean {
  return status != null && BETTABLE_STATUSES.has(status)
}

export function calcBetReturn(stake: number, odds: number, marketType: string): number {
  if (usesMalayOddsFormat(marketType)) {
    return Math.round(malayReturn(stake, odds))
  }
  return Math.round(stake * (odds > 0 ? odds : 2))
}

/** Net profit displayed as "Potential win" (excludes returned stake). */
export function calcPotentialWin(stake: number, odds: number, marketType: string): number {
  return calcBetReturn(stake, odds, marketType) - stake
}

export function betSlipMarketLabel(marketType: BetSelection['marketType']): string {
  switch (marketType) {
    case 'over_under':
      return 'Over/Under'
    case 'handicap':
      return 'Handicap'
    case 'winner':
      return '1x2'
    case 'malay':
      return '1x2'
    default:
      return String(marketType).replace('_', '/')
  }
}

export function formatBetSlipOdds(sel: BetSelection): string {
  return formatMalayOdds(sel.odds)
}
