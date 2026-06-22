export const MARKET_TYPES = {
  MALAY: 'malay',
  WINNER: 'winner',
  HANDICAP: 'handicap',
  OVER_UNDER: 'over_under',
} as const

export type MarketType = (typeof MARKET_TYPES)[keyof typeof MARKET_TYPES]

export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
  POSTPONED: 'postponed',
} as const

export type MatchStatus = (typeof MATCH_STATUS)[keyof typeof MATCH_STATUS]

export const BET_STATUS = {
  ACTIVE: 'active',
  WON: 'won',
  LOST: 'lost',
  CANCELLED: 'cancelled',
  VOID: 'void',
} as const

export type BetStatus = (typeof BET_STATUS)[keyof typeof BET_STATUS]

export const NOTIFICATION_TYPES = {
  BET_RESULT: 'bet_result',
  RANK_CHANGE: 'rank_change',
  SEASON: 'season',
  SYSTEM: 'system',
} as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES]
