export type OvertimeOdds = {
  american: number
  decimal: number
  normalizedImplied: number
}

/** Odds entry: full object (detail API) or normalized implied probability (basic API). */
export type OvertimeOddsValue = OvertimeOdds | number

export type OvertimeMarket = {
  gameId: string
  sport?: string
  leagueId: number
  leagueName?: string
  subLeagueId: number
  typeId: number
  type?: string
  line?: number
  maturity: number
  maturityDate?: string
  homeTeam: string
  awayTeam: string
  isOpen?: boolean
  isResolved?: boolean
  isCancelled?: boolean
  isPaused?: boolean
  odds: OvertimeOddsValue[]
  childMarkets?: OvertimeChildMarket[]
  statusCode: 'open' | 'paused' | 'resolved' | 'cancelled' | 'ongoing'
  positionNames?: string[]
  tournamentName?: string
}

export type OvertimeChildMarket = {
  typeId: number
  type?: string
  line?: number
  status?: number
  odds: OvertimeOddsValue[]
}

export type OvertimeLiveMarket = OvertimeMarket & {
  homeScore: number
  awayScore: number
  gameClock: number
  gamePeriod: string
}

export type OvertimeLiveMarketsResponse = {
  markets: OvertimeLiveMarket[]
  errors: string[]
}

export type OvertimeMarketsResponse = {
  responseHash?: string
  markets: OvertimeMarket[] | 'no change'
}

export type OvertimeSportMeta = {
  sport: string
  id: number
  label: string
}

export type OvertimeMarketTypeMeta = {
  id: number
  key: string
  name: string
}

export type OvertimeLeagueGroup = {
  id: number
  name: string
  count: number
}
