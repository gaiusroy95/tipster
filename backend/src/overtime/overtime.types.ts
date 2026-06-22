export interface Odds {
  american: number
  decimal: number
  normalizedImplied: number
}

export interface PlayerProps {
  playerId: number
  playerName: string
}

export interface CombinedPosition {
  typeId: number
  position: number
  line: number
}

export interface OvertimeMarket {
  gameId: string
  sport?: string
  leagueId: number
  leagueName?: string
  subLeagueId: number
  typeId: number
  type?: string
  line: number
  maturity: number
  maturityDate?: string
  homeTeam: string
  awayTeam: string
  status?: number
  isOpen?: boolean
  isResolved?: boolean
  isCancelled?: boolean
  isPaused?: boolean
  odds: Odds[]
  childMarkets?: OvertimeMarket[]
  statusCode?: string
  playerProps?: PlayerProps
  combinedPositions?: CombinedPosition[][]
  proof?: string[]
}

export interface LiveMarket extends OvertimeMarket {
  homeScore?: number
  awayScore?: number
  gameClock?: string
  gamePeriod?: string
}

export interface SportMeta {
  sport: string
  label: string
  id: number
  provider?: string
  scoringType?: string
  matchResolveType?: string
  periodType?: string
  isDrawAvailable?: boolean
  hidden?: boolean
  opticOddsName?: string
}

export type SportsMap = Record<string, SportMeta>

export interface MarketTypeMeta {
  id: number
  key: string
  name: string
  resultType: number
  outcomes?: string[]
  tooltipKey?: string
}

export type MarketTypesMap = Record<string, MarketTypeMeta>

export interface MarketsApiResponse {
  responseHash?: string
  markets: OvertimeMarket[] | Record<string, unknown> | 'no change'
}

export interface LiveMarketsApiResponse {
  markets: LiveMarket[]
  errors?: string[]
}

export interface EnrichedMarket {
  gameId: string
  homeTeam: string
  awayTeam: string
  sport: string
  leagueId: number
  leagueName: string
  subLeagueId: number
  typeId: number
  type: string
  line: number
  maturity: number
  maturityDate?: string
  statusCode: string
  odds: Odds[]
  childMarkets?: EnrichedMarket[]
  playerProps?: PlayerProps
}

export interface EnrichedLiveMarket extends EnrichedMarket {
  homeScore?: number
  awayScore?: number
  gameClock?: string
  gamePeriod?: string
}

export interface LeagueSummary {
  subLeagueId: number
  label: string
  sport: string
  leagueId?: number
  openMarketCount: number
}

export interface LeaguesBySport {
  sport: string
  leagues: LeagueSummary[]
  totalOpenMarkets: number
}

export interface CachedPayloadMeta {
  cachedAt: string
  stale: boolean
  responseHash?: string
}

export interface MarketsListResponse {
  markets: EnrichedMarket[]
  meta: CachedPayloadMeta
}

export interface LiveMarketsListResponse {
  markets: EnrichedLiveMarket[]
  errors: string[]
  meta: CachedPayloadMeta
}
