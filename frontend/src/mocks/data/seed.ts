import { bettingRules } from '@/core/config/bettingRules'
import { decimalToMalay, malayReturn } from '@/shared/utils/malayOdds'
import { getProfileAchievements, getUserAchievementProgress } from './achievementService'
import { getMockForumStats } from './mockForum'
import { buildOverallRankStats } from '@/features/profile/lib/buildOverallRankStats'
import type {
  User,
  League,
  Team,
  Match,
  Bet,
  WalletTransaction,
  LeaderboardEntry,
  Season,
  Notification,
  UserProfileStats,
  UserSettings,
} from './types'

const leagues: League[] = [
  { id: 'league-1', name: 'Premier League', country: 'England', sportId: 'soccer' },
  { id: 'league-2', name: 'La Liga', country: 'Spain', sportId: 'soccer' },
  { id: 'league-3', name: 'Serie A', country: 'Italy', sportId: 'soccer' },
]

const teams: Team[] = [
  { id: 'team-1', name: 'Arsenal', shortName: 'ARS' },
  { id: 'team-2', name: 'Chelsea', shortName: 'CHE' },
  { id: 'team-3', name: 'Liverpool', shortName: 'LIV' },
  { id: 'team-4', name: 'Manchester City', shortName: 'MCI' },
  { id: 'team-5', name: 'Real Madrid', shortName: 'RMA' },
  { id: 'team-6', name: 'Barcelona', shortName: 'BAR' },
  { id: 'team-7', name: 'Inter Milan', shortName: 'INT' },
  { id: 'team-8', name: 'AC Milan', shortName: 'ACM' },
]

function futureHours(h: number) {
  return new Date(Date.now() + h * 3600000).toISOString()
}

function pastHours(h: number) {
  return new Date(Date.now() - h * 3600000).toISOString()
}

function winnerMarket(
  homeLabel: string,
  awayLabel: string,
  ids: { home: string; draw: string; away: string },
  odds: { home: number; draw: number; away: number },
) {
  return {
    marketType: 'winner' as const,
    selections: [
      { id: ids.home, label: homeLabel, value: decimalToMalay(odds.home) },
      { id: ids.draw, label: 'Draw', value: decimalToMalay(odds.draw) },
      { id: ids.away, label: awayLabel, value: decimalToMalay(odds.away) },
    ],
  }
}

function twoWayMalayMarket(
  marketType: 'handicap' | 'over_under',
  selections: Array<{
    id: string
    label: string
    decimal: number
    handicap?: number
    line?: number
  }>,
) {
  return {
    marketType,
    selections: selections.map((sel) => ({
      id: sel.id,
      label: sel.label,
      value: decimalToMalay(sel.decimal),
      handicap: sel.handicap,
      line: sel.line,
    })),
  }
}

const matches: Match[] = [
  {
    id: 'match-1',
    leagueId: 'league-1',
    homeTeamId: 'team-1',
    awayTeamId: 'team-2',
    startTime: futureHours(2),
    status: 'scheduled',
    markets: [
      winnerMarket('Arsenal', 'Chelsea', { home: 'w1-home', draw: 'w1-draw', away: 'w1-away' }, {
        home: 1.73,
        draw: 4.12,
        away: 1.71,
      }),
      twoWayMalayMarket('handicap', [
        { id: 'h1-home', label: 'Arsenal -0.5', decimal: 1.95, handicap: -0.5 },
        { id: 'h1-away', label: 'Chelsea +0.5', decimal: 1.85, handicap: 0.5 },
      ]),
      twoWayMalayMarket('over_under', [
        { id: 'ou1-over', label: 'Over 2.5', decimal: 1.90, line: 2.5 },
        { id: 'ou1-under', label: 'Under 2.5', decimal: 1.92, line: 2.5 },
      ]),
    ],
  },
  {
    id: 'match-2',
    leagueId: 'league-1',
    homeTeamId: 'team-3',
    awayTeamId: 'team-4',
    startTime: futureHours(0.5),
    status: 'live',
    homeScore: 1,
    awayScore: 0,
    minute: 67,
    markets: [
      winnerMarket('Liverpool', 'Man City', { home: 'w2-home', draw: 'w2-draw', away: 'w2-away' }, {
        home: 2.07,
        draw: 3.65,
        away: 1.88,
      }),
      twoWayMalayMarket('handicap', [
        { id: 'h2-home', label: 'Liverpool -0.25', decimal: 2.05, handicap: -0.25 },
        { id: 'h2-away', label: 'Man City +0.25', decimal: 1.78, handicap: 0.25 },
      ]),
      twoWayMalayMarket('over_under', [
        { id: 'ou2-over', label: 'Over 3.0', decimal: 2.10, line: 3.0 },
        { id: 'ou2-under', label: 'Under 3.0', decimal: 1.75, line: 3.0 },
      ]),
    ],
  },
  {
    id: 'match-3',
    leagueId: 'league-2',
    homeTeamId: 'team-5',
    awayTeamId: 'team-6',
    startTime: futureHours(24),
    status: 'scheduled',
    markets: [
      winnerMarket('Real Madrid', 'Barcelona', { home: 'w3-home', draw: 'w3-draw', away: 'w3-away' }, {
        home: 1.82,
        draw: 3.90,
        away: 2.15,
      }),
      twoWayMalayMarket('handicap', [
        { id: 'h3-home', label: 'Real Madrid -0.5', decimal: 1.88, handicap: -0.5 },
        { id: 'h3-away', label: 'Barcelona +0.5', decimal: 1.94, handicap: 0.5 },
      ]),
      twoWayMalayMarket('over_under', [
        { id: 'ou3-over', label: 'Over 2.75', decimal: 1.85, line: 2.75 },
        { id: 'ou3-under', label: 'Under 2.75', decimal: 1.97, line: 2.75 },
      ]),
    ],
  },
  {
    id: 'match-4',
    leagueId: 'league-3',
    homeTeamId: 'team-7',
    awayTeamId: 'team-8',
    startTime: pastHours(3),
    status: 'finished',
    homeScore: 2,
    awayScore: 1,
    markets: [],
  },
]

const seasons: Season[] = [
  {
    id: 'season-1',
    name: 'Season 2025/26',
    startDate: '2025-08-01',
    endDate: '2026-08-31',
    isActive: true,
    description: 'Compete across Europe\'s top football leagues. Top 10 tipsters win physical prizes.',
    prizes: [
      { rankFrom: 1, rankTo: 1, name: 'Champion Trophy', description: 'Premium trophy and winner\'s medal' },
      { rankFrom: 2, rankTo: 3, name: 'Elite Tipster Kit', description: 'Signed football jersey and merchandise bundle' },
      { rankFrom: 4, rankTo: 10, name: 'Rising Star Award', description: 'Sports accessories gift set' },
    ],
  },
  {
    id: 'season-0',
    name: 'Season 2024/25',
    startDate: '2024-08-01',
    endDate: '2025-05-31',
    isActive: false,
    description: 'Previous season archive.',
    prizes: [
      { rankFrom: 1, rankTo: 1, name: 'Champion Trophy', description: 'Premium trophy' },
    ],
  },
]

function createDemoUser(id: string, displayName: string, username: string, balance: number, rank: number): User {
  return {
    id,
    email: `${username}@example.com`,
    displayName,
    username,
    balance,
    rank,
    createdAt: pastHours(720),
  }
}

const demoUsers: User[] = [
  {
    ...createDemoUser(
      'user-demo',
      'Demo Player',
      'demoplayer',
      bettingRules.initialBalance - bettingRules.standardStake,
      5,
    ),
    authProviders: ['email', 'google'],
    primaryAuthProvider: 'email',
    country: 'MY',
    signatureMode: 'text',
    postCount: 0,
  },
  createDemoUser('user-1', 'Alex Tipster', 'alextip', 12450, 1),
  createDemoUser('user-2', 'Sarah Pro', 'sarahpro', 11800, 2),
  createDemoUser('user-3', 'Mike Analyst', 'mikea', 11200, 3),
  createDemoUser('user-4', 'Emma Stats', 'emmastats', 10500, 4),
]

const leaderboard: LeaderboardEntry[] = demoUsers
  .filter((u) => u.id !== 'user-demo')
  .map((u, i) => ({
    userId: u.id,
    displayName: u.displayName,
    username: u.username,
    rank: i + 1,
    points: 1200 - i * 80,
    roi: 18.5 - i * 2,
    profitLoss: 2450 - i * 300,
    winRate: 62 - i * 3,
    totalBets: 145 - i * 10,
    form: (['W', 'W', 'L', 'W', 'D'] as const).slice(0, 5),
  }))

const userRankMeta: Record<string, { bestRank: number; rankChange: number }> = {
  'user-demo': { bestRank: 4, rankChange: 2 },
  'user-1': { bestRank: 1, rankChange: 0 },
  'user-2': { bestRank: 2, rankChange: 1 },
  'user-3': { bestRank: 3, rankChange: -1 },
  'user-4': { bestRank: 4, rankChange: 0 },
}

demoUsers.find((u) => u.id === 'user-demo')!.rank = 5
leaderboard.push({
  userId: 'user-demo',
  displayName: 'Demo Player',
  username: 'demoplayer',
  rank: 5,
  points: 920,
  roi: 8.2,
  profitLoss: 450,
  winRate: 55,
  totalBets: 42,
  form: ['W', 'L', 'W', 'W', 'L'],
})

let bets: Bet[] = [
  {
    id: 'bet-1',
    ticketReference: 'TA-DEMOPLAYER-20260101-1200-SEED01',
    userId: 'user-demo',
    matchId: 'match-2',
    marketType: 'winner',
    selectionId: 'w2-home',
    selectionLabel: 'Liverpool',
    odds: decimalToMalay(2.07),
    stake: bettingRules.standardStake,
    potentialReturn: Math.round(
      malayReturn(bettingRules.standardStake, decimalToMalay(2.07)),
    ),
    status: 'active',
    betSize: 'small',
    placedAt: pastHours(1),
  },
]

let transactions: WalletTransaction[] = [
  {
    id: 'tx-1',
    userId: 'user-demo',
    type: 'initial',
    amount: bettingRules.initialBalance,
    balanceAfter: bettingRules.initialBalance,
    description: 'Welcome bonus — initial virtual credits',
    createdAt: pastHours(720),
  },
  {
    id: 'tx-2',
    userId: 'user-demo',
    type: 'bet_placed',
    amount: -bettingRules.standardStake,
    balanceAfter: bettingRules.initialBalance - bettingRules.standardStake,
    description: 'Bet placed on Liverpool vs Man City',
    createdAt: pastHours(1),
    betId: 'bet-1',
  },
]

let notifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-demo',
    type: 'system',
    title: 'Welcome to Tipster Arena',
    message: 'You received 1,000,000 virtual credits. Start placing bets on upcoming fixtures!',
    read: false,
    createdAt: pastHours(720),
    link: '/fixtures',
  },
  {
    id: 'notif-2',
    userId: 'user-demo',
    type: 'bet_result',
    title: 'Bet placed successfully',
    message: 'Your bet on Liverpool is now active.',
    read: true,
    createdAt: pastHours(1),
    link: '/bets/active',
  },
]

const settings: Record<string, UserSettings> = {
  'user-demo': {
    emailNotifications: true,
    pushNotifications: false,
    showProfilePublic: true,
    twoFactorEnabled: false,
    twoFactorMethod: null,
    phoneNumberMasked: null,
  },
}

const socialLinks: Record<string, import('./socialAuth').SocialLink[]> = {
  'user-demo': [
    {
      provider: 'google',
      email: 'demoplayer@example.com',
      linkedAt: pastHours(500),
    },
  ],
}

const dailyBetCounts: Record<string, { date: string; count: number }> = {}

export const mockDb = {
  leagues,
  teams,
  matches,
  seasons,
  demoUsers,
  leaderboard,
  bets,
  transactions,
  notifications,
  settings,
  dailyBetCounts,
  socialLinks,

  getSocialLinks(userId: string) {
    return socialLinks[userId] ?? []
  },

  setSocialLinks(userId: string, links: import('./socialAuth').SocialLink[]) {
    socialLinks[userId] = links
  },

  getUser(id: string) {
    return demoUsers.find((u) => u.id === id)
  },

  getUserByEmail(email: string) {
    return demoUsers.find((u) => u.email === email)
  },

  upsertRemoteUser(user: User) {
    const existing = this.getUser(user.id)
    if (existing) {
      existing.email = user.email
      existing.displayName = user.displayName
      existing.username = user.username
      existing.balance = user.balance
      existing.rank = user.rank
      existing.avatarUrl = user.avatarUrl
      existing.authProviders = user.authProviders
      existing.primaryAuthProvider = user.primaryAuthProvider
      existing.createdAt = user.createdAt
      return existing
    }

    demoUsers.push({
      ...user,
      authProviders: user.authProviders ?? ['google'],
      primaryAuthProvider: user.primaryAuthProvider ?? 'google',
    })

    leaderboard.push({
      userId: user.id,
      displayName: user.displayName,
      username: user.username,
      rank: user.rank,
      points: 0,
      roi: 0,
      profitLoss: 0,
      winRate: 0,
      totalBets: 0,
      form: [],
    })

    userRankMeta[user.id] = { bestRank: user.rank, rankChange: 0 }
    settings[user.id] = {
      emailNotifications: true,
      pushNotifications: false,
      showProfilePublic: true,
      twoFactorEnabled: false,
      twoFactorMethod: null,
      phoneNumberMasked: null,
    }

    return user
  },

  getTeam(id: string) {
    return teams.find((t) => t.id === id)
  },

  getLeague(id: string) {
    return leagues.find((l) => l.id === id)
  },

  getMatch(id: string) {
    return matches.find((m) => m.id === id)
  },

  enrichBet(bet: Bet): Bet {
    const match = this.getMatch(bet.matchId)
    const homeTeam = match ? this.getTeam(match.homeTeamId) : undefined
    const awayTeam = match ? this.getTeam(match.awayTeamId) : undefined
    const league = match ? this.getLeague(match.leagueId) : undefined
    const matchStatus =
      match?.status === 'live'
        ? 'live'
        : match?.status === 'finished'
          ? 'finished'
          : 'scheduled'
    const isCancellable =
      bet.status === 'active' && matchStatus === 'scheduled'
    return { ...bet, match, homeTeam, awayTeam, league, matchStatus, isCancellable }
  },

  getProfileStats(userId: string): UserProfileStats | null {
    const user = this.getUser(userId)
    if (!user) return null
    const userBets = bets.filter((b) => b.userId === userId)
    const settled = userBets.filter((b) => b.status === 'won' || b.status === 'lost')
    const wins = settled.filter((b) => b.status === 'won').length
    const losses = settled.filter((b) => b.status === 'lost').length
    const entry = leaderboard.find((e) => e.userId === userId)
    const currentRank = entry?.rank ?? user.rank
    const meta = userRankMeta[userId]

    return {
      userId,
      displayName: user.displayName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      rank: currentRank,
      balance: user.balance,
      overallRank: buildOverallRankStats(currentRank, entry?.points ?? 0, {
        bestRank: meta?.bestRank ?? currentRank,
        rankChange: meta?.rankChange ?? 0,
      }),
      seasonStats: {
        points: entry?.points ?? 0,
        roi: entry?.roi ?? 0,
        profitLoss: entry?.profitLoss ?? 0,
        winRate: entry?.winRate ?? 0,
        totalBets: userBets.length,
        wins,
        losses,
        activeBets: userBets.filter((b) => b.status === 'active').length,
      },
      bettingStats: {
        avgStake: userBets.length ? userBets.reduce((s, b) => s + b.stake, 0) / userBets.length : 0,
        biggestWin: 850,
        biggestLoss: -400,
        favoriteMarket: 'winner',
      },
      form: entry?.form ?? ['W', 'L', 'W'],
      leaguePerformance: [
        { leagueId: 'league-1', leagueName: 'Premier League', profitLoss: 320, bets: 18 },
        { leagueId: 'league-2', leagueName: 'La Liga', profitLoss: 150, bets: 12 },
        { leagueId: 'league-3', leagueName: 'Serie A', profitLoss: -80, bets: 8 },
      ],
      performanceHistory: [
        { date: '2026-01', profitLoss: 120, cumulative: 120 },
        { date: '2026-02', profitLoss: 80, cumulative: 200 },
        { date: '2026-03', profitLoss: -50, cumulative: 150 },
        { date: '2026-04', profitLoss: 200, cumulative: 350 },
        { date: '2026-05', profitLoss: 100, cumulative: 450 },
      ],
      achievements: getProfileAchievements(this, userId),
      achievementProgress: getUserAchievementProgress(this, userId),
      socialStats: {
        posts: user.postCount ?? 0,
        followers: 0,
        following: 0,
        views: getMockForumStats(userId).forumViewsTotal,
      },
    }
  },

  getTodayBetCount(userId: string) {
    const today = new Date().toISOString().slice(0, 10)
    const record = dailyBetCounts[userId]
    if (!record || record.date !== today) return 0
    return record.count
  },

  incrementDailyBetCount(userId: string) {
    const today = new Date().toISOString().slice(0, 10)
    const record = dailyBetCounts[userId]
    if (!record || record.date !== today) {
      dailyBetCounts[userId] = { date: today, count: 1 }
    } else {
      record.count += 1
    }
  },

  setBets(newBets: Bet[]) {
    bets = newBets
  },

  setTransactions(newTx: WalletTransaction[]) {
    transactions = newTx
  },

  setNotifications(newNotifs: Notification[]) {
    notifications = newNotifs
  },

  getBets() {
    return bets
  },

  getTransactions() {
    return transactions
  },

  getNotifications() {
    return notifications
  },
}
