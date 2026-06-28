import { getListDisplayMarketTypes } from '@/features/fixtures/lib/enabledMarketTypes'
import type { MatchWithTeams } from '@/features/fixtures/types/fixture'

function hasValidOddsValue(value: number): boolean {
  return Number.isFinite(value) && value > 1
}

/** True when a fixture card can show at least one primary odds column. */
export function matchHasDisplayableOdds(match: MatchWithTeams): boolean {
  return getListDisplayMarketTypes().some((marketType) => {
    const market = match.markets.find((m) => m.marketType === marketType)
    return market?.selections.some((sel) => hasValidOddsValue(sel.value)) ?? false
  })
}

export function filterMatchesWithDisplayableOdds(matches: MatchWithTeams[]): MatchWithTeams[] {
  return matches.filter(matchHasDisplayableOdds)
}
