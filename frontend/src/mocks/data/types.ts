import type { MarketType, BetStatus, MatchStatus, NotificationType } from '@/core/constants/markets'

export type AuthProviderKind = 'email' | 'google' | 'facebook' | 'apple'

export type SignatureMode = 'text' | 'banner'

export interface User {
  id: string
  email: string
  displayName: string
  username: string
  avatarUrl?: string
  country?: string
  signature?: string
  signatureLink?: string
  signatureMode?: SignatureMode
  postCount?: number
  balance: number
  rank: number
  createdAt: string
  authProviders?: AuthProviderKind[]
  primaryAuthProvider?: AuthProviderKind
}

export interface League {
  id: string
  name: string
  country: string
  sportId: string
  logoUrl?: string
}

export interface Team {
  id: string
  name: string
  shortName: string
  logoUrl?: string
}

export interface OddsSelection {
  id: string
  label: string
  value: number
  handicap?: number
  line?: number
}

export interface MarketOdds {
  marketType: MarketType
  selections: OddsSelection[]
}

export interface Match {
  id: string
  leagueId: string
  homeTeamId: string
  awayTeamId: string
  startTime: string
  status: MatchStatus
  homeScore?: number
  awayScore?: number
  minute?: number
  markets: MarketOdds[]
}

export interface Bet {
  id: string
  userId: string
  matchId: string
  marketType: MarketType
  selectionId: string
  selectionLabel: string
  odds: number
  stake: number
  potentialReturn: number
  status: BetStatus
  betSize: 'small' | 'big'
  placedAt: string
  settledAt?: string
  profitLoss?: number
  match?: Match
  homeTeam?: Team
  awayTeam?: Team
  league?: League
}

export interface WalletTransaction {
  id: string
  userId: string
  type: 'initial' | 'bet_placed' | 'bet_won' | 'bet_lost' | 'bet_cancelled' | 'penalty'
  amount: number
  balanceAfter: number
  description: string
  createdAt: string
  betId?: string
}

export interface LeaderboardEntry {
  userId: string
  displayName: string
  username: string
  avatarUrl?: string
  rank: number
  points: number
  roi: number
  profitLoss: number
  winRate: number
  totalBets: number
  form: ('W' | 'L' | 'D')[]
}

export interface Season {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  description: string
  prizes: PrizeTier[]
}

export interface PrizeTier {
  rankFrom: number
  rankTo: number
  name: string
  description: string
  imageUrl?: string
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}

export interface UserProfileStats {
  userId: string
  displayName: string
  username: string
  avatarUrl?: string
  rank: number
  balance: number
  seasonStats: {
    points: number
    roi: number
    profitLoss: number
    winRate: number
    totalBets: number
    wins: number
    losses: number
    activeBets: number
  }
  bettingStats: {
    avgStake: number
    biggestWin: number
    biggestLoss: number
    favoriteMarket: MarketType
  }
  form: ('W' | 'L' | 'D')[]
  leaguePerformance: { leagueId: string; leagueName: string; profitLoss: number; bets: number }[]
  performanceHistory: { date: string; profitLoss: number; cumulative: number }[]
  achievements: { id: string; name: string; description: string; earnedAt: string }[]
}

export interface UserSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  showProfilePublic: boolean
}

export interface DashboardData {
  balance: number
  rank: number
  activeBetsCount: number
  todayProfitLoss: number
  recentActivity: WalletTransaction[]
  form: ('W' | 'L' | 'D')[]
}
