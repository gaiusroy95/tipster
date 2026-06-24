import { MARKET_TYPES } from '@/core/constants/markets'
import type { MatchWithTeams } from '@/features/fixtures/types/fixture'

const LIST_MARKET_TYPES = [
  MARKET_TYPES.WINNER,
  MARKET_TYPES.HANDICAP,
  MARKET_TYPES.OVER_UNDER,
] as const

function hasValidOddsValue(value: number): boolean {
  return Number.isFinite(value) && value > 1
}

/** True when a fixture card can show at least one primary odds column. */
export function matchHasDisplayableOdds(match: MatchWithTeams): boolean {
  return LIST_MARKET_TYPES.some((marketType) => {
    const market = match.markets.find((m) => m.marketType === marketType)
    return market?.selections.some((sel) => hasValidOddsValue(sel.value)) ?? false
  })
}

export function filterMatchesWithDisplayableOdds(matches: MatchWithTeams[]): MatchWithTeams[] {
  return matches.filter(matchHasDisplayableOdds)
}
