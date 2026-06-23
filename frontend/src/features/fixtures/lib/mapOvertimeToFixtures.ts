import { MARKET_TYPES, MATCH_STATUS, type MarketType, type MatchStatus } from '@/core/constants/markets'
import type { League, MarketOdds, Match, OddsSelection, Team } from '@/mocks/data/types'
import { mapOvertimeCategoryToSportId } from '@/features/fixtures/lib/mapOvertimeSport'
import type {
  OvertimeChildMarket,
  OvertimeLiveMarket,
  OvertimeMarket,
  OvertimeMarketTypeMeta,
  OvertimeOddsValue,
  OvertimeSportMeta,
} from '@/features/fixtures/types/overtime'
import type { MatchWithTeams } from '@/features/fixtures/types/fixture'

function teamShortName(name: string): string {
  const alpha = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  if (alpha.length >= 3) return alpha.slice(0, 3)
  return name.slice(0, 3).toUpperCase()
}

function teamIdFromName(name: string): string {
  return `team-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
}

export function decimalToMalay(decimal: number): number {
  if (!decimal || decimal <= 1) return 0
  if (decimal >= 2) return Math.round((decimal - 1) * 100) / 100
  return Math.round((-1 / (decimal - 1)) * 100) / 100
}

function americanToDecimal(american: number): number {
  if (!Number.isFinite(american) || american === 0) return 0
  if (american > 0) return american / 100 + 1
  return 100 / Math.abs(american) + 1
}

/** Convert Overtime odds to decimal display values (UI expects decimal > 1). */
export function coerceDecimalOdds(odd: OvertimeOddsValue | undefined): number {
  if (odd == null) return 0

  // Basic-properties API: odds are normalized implied probabilities (0–1).
  if (typeof odd === 'number') {
    if (!Number.isFinite(odd) || odd <= 0) return 0
    if (odd >= 1) return Math.round(odd * 100) / 100
    return Math.round((1 / odd) * 100) / 100
  }

  if (odd.decimal != null && Number.isFinite(odd.decimal) && odd.decimal > 1) {
    return odd.decimal
  }
  if (
    odd.normalizedImplied != null &&
    Number.isFinite(odd.normalizedImplied) &&
    odd.normalizedImplied > 0 &&
    odd.normalizedImplied < 1
  ) {
    return Math.round((1 / odd.normalizedImplied) * 100) / 100
  }
  if (odd.american != null && Number.isFinite(odd.american)) {
    return Math.round(americanToDecimal(odd.american) * 100) / 100
  }
  return 0
}

function isValidOddsValue(value: number): boolean {
  return Number.isFinite(value) && value > 1
}

function marketTypeKey(
  market: OvertimeMarket,
  typeById: Record<number, OvertimeMarketTypeMeta>,
): string {
  const meta = typeById[market.typeId]
  return (meta?.key ?? market.type ?? '').toLowerCase()
}

function classifyMarketKind(
  market: OvertimeMarket,
  typeById: Record<number, OvertimeMarketTypeMeta>,
): MarketType | null {
  const typeId = market.typeId
  if (typeId === 0) return MARKET_TYPES.WINNER
  if (typeId === 10001) return MARKET_TYPES.HANDICAP
  if (typeId === 10002) return MARKET_TYPES.OVER_UNDER

  const key = marketTypeKey(market, typeById)
  if (key.includes('winner') && !key.includes('period') && !key.includes('half')) {
    return MARKET_TYPES.WINNER
  }
  if (key.includes('spread') || key.includes('handicap')) return MARKET_TYPES.HANDICAP
  if (key.includes('total') || key.includes('overunder') || key.includes('over_under')) {
    return MARKET_TYPES.OVER_UNDER
  }
  return null
}

function enrichChildMarket(child: OvertimeChildMarket, parent: OvertimeMarket): OvertimeMarket {
  return {
    gameId: parent.gameId,
    leagueId: parent.leagueId,
    leagueName: parent.leagueName,
    subLeagueId: parent.subLeagueId,
    sport: parent.sport,
    typeId: child.typeId,
    type: child.type,
    line: child.line,
    maturity: parent.maturity,
    maturityDate: parent.maturityDate,
    homeTeam: parent.homeTeam,
    awayTeam: parent.awayTeam,
    odds: child.odds,
    statusCode: parent.statusCode,
  }
}

function selectionId(gameId: string, marketType: MarketType, index: number, line?: number) {
  const linePart = line !== undefined ? `-${line}` : ''
  return `${gameId}-${marketType}-${index}${linePart}`
}

function mapWinnerMarket(
  market: OvertimeMarket,
  gameId: string,
): MarketOdds | null {
  if (!market.odds?.length) return null

  const labels =
    market.odds.length >= 3
      ? [market.homeTeam, 'Draw', market.awayTeam]
      : [market.homeTeam, market.awayTeam]

  const selections: OddsSelection[] = market.odds
    .map((odd, index) => ({
      id: selectionId(gameId, MARKET_TYPES.WINNER, index),
      label: labels[index] ?? `Option ${index + 1}`,
      value: coerceDecimalOdds(odd),
    }))
    .filter((sel) => isValidOddsValue(sel.value))

  if (!selections.length) return null

  return { marketType: MARKET_TYPES.WINNER, selections }
}

function mapHandicapMarket(market: OvertimeMarket, gameId: string): MarketOdds | null {
  if (!market.odds?.length || market.line == null) return null

  const line = market.line
  const awayLine = -line
  const homeDecimal = coerceDecimalOdds(market.odds[0])
  const awayDecimal = coerceDecimalOdds(market.odds[1])
  if (!isValidOddsValue(homeDecimal) && !isValidOddsValue(awayDecimal)) return null

  const selections: OddsSelection[] = [
    {
      id: selectionId(gameId, MARKET_TYPES.HANDICAP, 0, line),
      label: `${market.homeTeam} ${line}`,
      value: homeDecimal,
      handicap: line,
    },
    {
      id: selectionId(gameId, MARKET_TYPES.HANDICAP, 1, awayLine),
      label: `${market.awayTeam} ${awayLine > 0 ? '+' : ''}${awayLine}`,
      value: awayDecimal,
      handicap: awayLine,
    },
  ].filter((sel) => isValidOddsValue(sel.value))

  if (!selections.length) return null

  return { marketType: MARKET_TYPES.HANDICAP, selections }
}

function mapTotalMarket(market: OvertimeMarket, gameId: string): MarketOdds | null {
  if (!market.odds?.length || market.line == null) return null

  const line = market.line
  const overDecimal = coerceDecimalOdds(market.odds[0])
  const underDecimal = coerceDecimalOdds(market.odds[1])
  if (!isValidOddsValue(overDecimal) && !isValidOddsValue(underDecimal)) return null

  const selections: OddsSelection[] = [
    {
      id: selectionId(gameId, MARKET_TYPES.OVER_UNDER, 0, line),
      label: `Over ${line}`,
      value: overDecimal,
      line,
    },
    {
      id: selectionId(gameId, MARKET_TYPES.OVER_UNDER, 1, line),
      label: `Under ${line}`,
      value: underDecimal,
      line,
    },
  ].filter((sel) => isValidOddsValue(sel.value))

  if (!selections.length) return null

  return { marketType: MARKET_TYPES.OVER_UNDER, selections }
}

function mapMalayMarket(market: OvertimeMarket, gameId: string): MarketOdds | null {
  const homeDecimal = coerceDecimalOdds(market.odds[0])
  const awayDecimal = coerceDecimalOdds(market.odds[market.odds.length >= 3 ? 2 : 1])
  if (!isValidOddsValue(homeDecimal) || !isValidOddsValue(awayDecimal)) return null

  return {
    marketType: MARKET_TYPES.MALAY,
    selections: [
      {
        id: selectionId(gameId, MARKET_TYPES.MALAY, 0),
        label: market.homeTeam,
        value: decimalToMalay(homeDecimal),
      },
      {
        id: selectionId(gameId, MARKET_TYPES.MALAY, 1),
        label: market.awayTeam,
        value: decimalToMalay(awayDecimal),
      },
    ],
  }
}

function buildMarketOdds(
  primary: OvertimeMarket,
  related: OvertimeMarket[],
  typeById: Record<number, OvertimeMarketTypeMeta>,
): MarketOdds[] {
  const childMarkets = (primary.childMarkets ?? []).map((child) => enrichChildMarket(child, primary))
  const candidates = [primary, ...related.filter((m) => m.gameId === primary.gameId), ...childMarkets]

  const result: MarketOdds[] = []
  let winnerSource: OvertimeMarket | null = null
  const gameId = primary.gameId

  for (const market of candidates) {
    const kind = classifyMarketKind(market, typeById)
    if (!kind) continue

    if (kind === MARKET_TYPES.WINNER) {
      const mapped = mapWinnerMarket(market, gameId)
      if (mapped) {
        if (!result.some((m) => m.marketType === MARKET_TYPES.WINNER)) {
          result.push(mapped)
          winnerSource = market
        }
      }
    } else if (kind === MARKET_TYPES.HANDICAP) {
      if (!result.some((m) => m.marketType === MARKET_TYPES.HANDICAP)) {
        const mapped = mapHandicapMarket(market, gameId)
        if (mapped) result.push(mapped)
      }
    } else if (kind === MARKET_TYPES.OVER_UNDER) {
      if (!result.some((m) => m.marketType === MARKET_TYPES.OVER_UNDER)) {
        const mapped = mapTotalMarket(market, gameId)
        if (mapped) result.push(mapped)
      }
    }
  }

  if (winnerSource) {
    const malay = mapMalayMarket(winnerSource, gameId)
    if (malay && !result.some((m) => m.marketType === MARKET_TYPES.MALAY)) {
      result.push(malay)
    }
  }

  return result
}

function resolveMatchStatus(
  market: OvertimeMarket,
  live?: OvertimeLiveMarket,
  filterStatus?: string,
): MatchStatus {
  if (live || market.statusCode === 'ongoing') return MATCH_STATUS.LIVE
  if (market.isCancelled || market.statusCode === 'cancelled') return MATCH_STATUS.POSTPONED
  if (market.isResolved || market.statusCode === 'resolved') return MATCH_STATUS.FINISHED
  if (filterStatus === MATCH_STATUS.FINISHED) return MATCH_STATUS.FINISHED
  if (filterStatus === MATCH_STATUS.LIVE) return MATCH_STATUS.LIVE
  return MATCH_STATUS.SCHEDULED
}

function liveMinute(live?: OvertimeLiveMarket): number | undefined {
  if (!live) return undefined
  const clock = live.gameClock
  if (!clock) return undefined
  return clock > 120 ? Math.floor(clock / 60) : clock
}

export function mapOvertimeMarketToMatch(
  primary: OvertimeMarket,
  related: OvertimeMarket[],
  typeById: Record<number, OvertimeMarketTypeMeta>,
  sportsBySubLeague: Record<number, { sport: string; label: string }>,
  live?: OvertimeLiveMarket,
  filterStatus?: string,
): MatchWithTeams {
  const gameId = primary.gameId

  const sportCategory =
    primary.sport ||
    sportsBySubLeague[primary.subLeagueId]?.sport ||
    'Soccer'
  const sportId = mapOvertimeCategoryToSportId(sportCategory)

  const league: League = {
    id: String(primary.leagueId),
    name:
      primary.leagueName ||
      primary.tournamentName ||
      sportsBySubLeague[primary.subLeagueId]?.label ||
      'League',
    country: '',
    sportId,
  }

  const homeTeam: Team = {
    id: teamIdFromName(primary.homeTeam),
    name: primary.homeTeam,
    shortName: teamShortName(primary.homeTeam),
  }

  const awayTeam: Team = {
    id: teamIdFromName(primary.awayTeam),
    name: primary.awayTeam,
    shortName: teamShortName(primary.awayTeam),
  }

  const status = resolveMatchStatus(primary, live, filterStatus)

  const match: Match = {
    id: gameId,
    leagueId: league.id,
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    startTime: primary.maturityDate || new Date(primary.maturity * 1000).toISOString(),
    status,
    homeScore: live?.homeScore,
    awayScore: live?.awayScore,
    minute: liveMinute(live),
    markets: buildMarketOdds(primary, related, typeById),
  }

  return { ...match, homeTeam, awayTeam, league }
}

export function groupMarketsByGameId(markets: OvertimeMarket[]): Map<string, OvertimeMarket[]> {
  const groups = new Map<string, OvertimeMarket[]>()
  for (const market of markets) {
    if (!market.gameId) continue
    const list = groups.get(market.gameId) ?? []
    list.push(market)
    groups.set(market.gameId, list)
  }
  return groups
}

export function pickPrimaryMarket(markets: OvertimeMarket[]): OvertimeMarket | null {
  if (!markets.length) return null
  const winner = markets.find(
    (m) => m.typeId === 0 || (m.type?.toLowerCase().includes('winner') ?? false),
  )
  return winner ?? markets[0]
}

export function mapLeaguesResponse(
  grouped: Record<string, { id: number; name: string; count: number }[]>,
  sportId?: string,
): League[] {
  const leagues: League[] = []

  for (const [category, items] of Object.entries(grouped)) {
    const mappedSportId = mapOvertimeCategoryToSportId(category)
    if (sportId && mappedSportId !== sportId) continue

    for (const item of items) {
      leagues.push({
        id: String(item.id),
        name: item.name,
        country: category,
        sportId: mappedSportId,
      })
    }
  }

  return leagues.sort((a, b) => a.name.localeCompare(b.name))
}

export function normalizeSportsCatalog(
  raw: Record<string, OvertimeSportMeta>,
): Record<number, { sport: string; label: string }> {
  const result: Record<number, { sport: string; label: string }> = {}
  for (const entry of Object.values(raw)) {
    if (entry?.id != null) {
      result[entry.id] = { sport: entry.sport, label: entry.label }
    }
  }
  return result
}

export function normalizeMarketTypes(
  raw: Record<string, OvertimeMarketTypeMeta>,
): Record<number, OvertimeMarketTypeMeta> {
  const result: Record<number, OvertimeMarketTypeMeta> = {}
  for (const entry of Object.values(raw)) {
    result[entry.id] = entry
  }
  return result
}
