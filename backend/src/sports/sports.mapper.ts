import type {
  EnrichedLiveMarket,
  EnrichedMarket,
  LeaguesBySport,
  LiveMarket,
  OvertimeMarket,
  SportMeta,
  SportsMap,
} from '../overtime/overtime.types'

const CACHE_KEYS = {
  sports: 'overtime:sports',
  marketTypes: 'overtime:market-types',
  markets: 'overtime:markets',
  marketsHash: 'overtime:markets:hash',
  marketsCachedAt: 'overtime:markets:cachedAt',
  liveMarkets: 'overtime:live-markets',
  liveCachedAt: 'overtime:live:cachedAt',
  marketDetail: (gameId: string) => `overtime:market:${gameId}`,
  marketDetailCachedAt: (gameId: string) => `overtime:market:${gameId}:cachedAt`,
} as const

export { CACHE_KEYS }

export function resolveSportName(market: OvertimeMarket, sportsMap: SportsMap): string {
  if (market.sport) return market.sport
  const meta = sportsMap[String(market.subLeagueId)]
  return meta?.sport ?? 'Unknown'
}

export function resolveLeagueName(market: OvertimeMarket, sportsMap: SportsMap): string {
  if (market.leagueName) return market.leagueName
  const meta = sportsMap[String(market.subLeagueId)]
  return meta?.label ?? `League ${market.subLeagueId}`
}

export function enrichMarket(market: OvertimeMarket, sportsMap: SportsMap): EnrichedMarket {
  return {
    gameId: market.gameId,
    homeTeam: market.homeTeam,
    awayTeam: market.awayTeam,
    sport: resolveSportName(market, sportsMap),
    leagueId: market.leagueId,
    leagueName: resolveLeagueName(market, sportsMap),
    subLeagueId: market.subLeagueId,
    typeId: market.typeId,
    type: market.type ?? 'unknown',
    line: market.line,
    maturity: market.maturity,
    maturityDate: market.maturityDate,
    statusCode: market.statusCode ?? 'open',
    odds: market.odds,
    playerProps: market.playerProps,
    childMarkets: market.childMarkets?.map((child) => enrichMarket(child, sportsMap)),
  }
}

export function enrichLiveMarket(market: LiveMarket, sportsMap: SportsMap): EnrichedLiveMarket {
  const enriched = enrichMarket(market, sportsMap)
  return {
    ...enriched,
    homeScore: market.homeScore,
    awayScore: market.awayScore,
    gameClock: market.gameClock,
    gamePeriod: market.gamePeriod,
  }
}

export function enrichMarkets(markets: OvertimeMarket[], sportsMap: SportsMap): EnrichedMarket[] {
  return markets.map((market) => enrichMarket(market, sportsMap))
}

export function enrichLiveMarkets(markets: LiveMarket[], sportsMap: SportsMap): EnrichedLiveMarket[] {
  return markets.map((market) => enrichLiveMarket(market, sportsMap))
}

export function buildLeaguesBySport(
  sportsMap: SportsMap,
  markets: EnrichedMarket[],
): LeaguesBySport[] {
  const counts = new Map<number, number>()

  for (const market of markets) {
    counts.set(market.subLeagueId, (counts.get(market.subLeagueId) ?? 0) + 1)
  }

  const bySport = new Map<string, LeaguesBySport>()

  for (const [subLeagueId, meta] of Object.entries(sportsMap)) {
    const id = Number(subLeagueId)
    const openMarketCount = counts.get(id) ?? 0
    if (meta.hidden) continue

    const sportGroup = bySport.get(meta.sport) ?? {
      sport: meta.sport,
      leagues: [],
      totalOpenMarkets: 0,
    }

    sportGroup.leagues.push({
      subLeagueId: id,
      label: meta.label,
      sport: meta.sport,
      leagueId: meta.id,
      openMarketCount,
    })
    sportGroup.totalOpenMarkets += openMarketCount
    bySport.set(meta.sport, sportGroup)
  }

  return Array.from(bySport.values())
    .map((group) => ({
      ...group,
      leagues: group.leagues.sort((a, b) => b.openMarketCount - a.openMarketCount),
    }))
    .sort((a, b) => b.totalOpenMarkets - a.totalOpenMarkets)
}

export function combineNormalizedImplied(odds: number[]): number {
  const combined = odds.reduce((acc, odd) => acc * (1 / odd), 1)
  return 1 / combined
}
