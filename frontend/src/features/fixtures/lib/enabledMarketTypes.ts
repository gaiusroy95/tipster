import { MARKET_TYPES, type MarketType } from '@/core/constants/markets'
import type { MatchWithTeams } from '@/features/fixtures/types/fixture'

const ALL_MARKET_TYPES: MarketType[] = [
  MARKET_TYPES.WINNER,
  MARKET_TYPES.HANDICAP,
  MARKET_TYPES.OVER_UNDER,
]

const DEFAULT_LIST_MARKET_TYPES: MarketType[] = [
  MARKET_TYPES.WINNER,
  MARKET_TYPES.HANDICAP,
  MARKET_TYPES.OVER_UNDER,
]

let enabledCache: MarketType[] | null = null

function isMarketType(value: string): value is MarketType {
  return ALL_MARKET_TYPES.includes(value as MarketType)
}

export function setEnabledMarketTypes(marketTypes: string[]): void {
  enabledCache = marketTypes.filter(isMarketType)
}

export function clearEnabledMarketTypesCache(): void {
  enabledCache = null
}

export function getEnabledMarketTypes(): MarketType[] {
  return enabledCache ?? DEFAULT_LIST_MARKET_TYPES
}

/** Market types shown as odds columns on fixture list cards. */
export function getListDisplayMarketTypes(): MarketType[] {
  const enabled = new Set(getEnabledMarketTypes())
  return DEFAULT_LIST_MARKET_TYPES.filter((type) => enabled.has(type))
}

export function filterMatchMarkets(match: MatchWithTeams): MatchWithTeams {
  const enabled = new Set(getEnabledMarketTypes())
  return {
    ...match,
    markets: match.markets.filter(
      (market) => enabled.has(market.marketType) && market.marketType !== MARKET_TYPES.MALAY,
    ),
  }
}

export function filterMatchesByEnabledMarkets(matches: MatchWithTeams[]): MatchWithTeams[] {
  return matches.map(filterMatchMarkets)
}
