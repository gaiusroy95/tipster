import { http, HttpResponse } from 'msw'
import { mockDb } from '@/mocks/data/seed'
import { mockApiPath as p, mockApiBase } from '@/mocks/config'
import { bettingRules, getBetSize } from '@/core/config/bettingRules'
import { calculateCancellationPenalty } from '@/core/config/bettingRules'
import type { Bet, User } from '@/mocks/data/types'
import {
  ALL_SOCIAL_PROVIDERS,
} from '@/core/constants/socialProviders'
import type { SocialAuthProvider } from '@/features/auth/types/socialAuth'
import {
  buildMockCallbackUrl,
  consumeOAuthState,
  createSocialUser,
  mergeAuthProviders,
  removeAuthProvider,
  resolveMockProfile,
} from '@/mocks/data/socialAuth'
import {
  buildEspnNewsUrl,
  mapEspnNewsResponse,
  type EspnNewsApiResponse,
} from '@/features/news/api/espnAdapter'
import { getFallbackSportsNewsFeed } from '@/features/news/api/fallbackNews'
import type { SportsNewsSport } from '@/features/news/types/news'

const tokens: Record<string, string> = {}

function json<T>(data: T, status = 200) {
  return HttpResponse.json({ data }, { status })
}

function error(code: string, message: string, status = 400) {
  return HttpResponse.json({ code, message }, { status })
}

function getUserId(request: Request): string | null {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7)
  return tokens[token] ?? null
}

function malayReturn(stake: number, odds: number): number {
  if (odds > 0) return stake + stake * odds
  return stake + stake
}

function isSocialProvider(value: string): value is SocialAuthProvider {
  return ALL_SOCIAL_PROVIDERS.includes(value as SocialAuthProvider)
}

function issueToken(userId: string) {
  const token = `token-${userId}`
  tokens[token] = userId
  return token
}

function findUserBySocialEmail(email: string) {
  return mockDb.demoUsers.find((u) => u.email === email)
}

export const handlers = [
  http.post(p('/auth/register'), async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string; displayName: string; username: string }
    if (mockDb.getUserByEmail(body.email)) {
      return error('EMAIL_EXISTS', 'Email already registered', 409)
    }
    const id = `user-${Date.now()}`
    const user: User = {
      id,
      email: body.email,
      displayName: body.displayName,
      username: body.username,
      balance: bettingRules.initialBalance,
      rank: mockDb.leaderboard.length + 1,
      createdAt: new Date().toISOString(),
      authProviders: ['email'],
      primaryAuthProvider: 'email',
    }
    mockDb.demoUsers.push(user)
    const tx = mockDb.getTransactions()
    tx.unshift({
      id: `tx-${Date.now()}`,
      userId: id,
      type: 'initial',
      amount: bettingRules.initialBalance,
      balanceAfter: bettingRules.initialBalance,
      description: 'Welcome bonus — initial virtual credits',
      createdAt: new Date().toISOString(),
    })
    mockDb.setTransactions(tx)
    const token = `token-${id}`
    tokens[token] = id
    return json({ user, token })
  }),

  http.post(p('/auth/login'), async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    const user = mockDb.getUserByEmail(body.email)
    if (!user || body.password.length < 6) {
      return error('INVALID_CREDENTIALS', 'Invalid email or password', 401)
    }
    const token = `token-${user.id}`
    tokens[token] = user.id
    return json({ user, token })
  }),

  http.post(p('/auth/forgot-password'), async () => json({ message: 'Reset link sent if email exists' })),

  http.post(p('/auth/reset-password'), async () => json({ message: 'Password reset successful' })),

  http.get(p('/auth/me'), ({ request }) => {
    const userId = getUserId(request)
    if (!userId) return error('UNAUTHORIZED', 'Not authenticated', 401)
    const user = mockDb.getUser(userId)
    if (!user) return error('NOT_FOUND', 'User not found', 404)
    return json(user)
  }),

  http.get(p('/auth/oauth/:provider/url'), ({ params, request }) => {
    const provider = params.provider as string
    if (!isSocialProvider(provider)) {
      return error('INVALID_PROVIDER', 'Unsupported social provider', 400)
    }

    const url = new URL(request.url)
    const mode = url.searchParams.get('mode') ?? 'login'
    const redirectUri = url.searchParams.get('redirectUri')
    if (!redirectUri) {
      return error('INVALID_REQUEST', 'redirectUri is required', 400)
    }
    if (mode !== 'login' && mode !== 'register' && mode !== 'link') {
      return error('INVALID_REQUEST', 'Invalid OAuth mode', 400)
    }

    if (mode === 'link') {
      const userId = getUserId(request)
      if (!userId) return error('UNAUTHORIZED', 'Not authenticated', 401)
      const callbackUrl = buildMockCallbackUrl(provider, 'link', redirectUri, userId)
      return json({ url: callbackUrl })
    }

    const callbackUrl = buildMockCallbackUrl(provider, mode as 'login' | 'register', redirectUri)
    return json({ url: callbackUrl })
  }),

  http.post(p('/auth/oauth/:provider'), async ({ params, request }) => {
    const provider = params.provider as string
    if (!isSocialProvider(provider)) {
      return error('INVALID_PROVIDER', 'Unsupported social provider', 400)
    }

    const body = (await request.json()) as { code?: string; state?: string; redirectUri?: string }
    if (!body.code?.startsWith('mock-') || !body.state) {
      return error('INVALID_OAUTH', 'Invalid OAuth code or state', 400)
    }

    const oauthState = consumeOAuthState(body.state)
    if (!oauthState || oauthState.provider !== provider) {
      return error('INVALID_OAUTH', 'OAuth state expired or invalid', 400)
    }
    if (oauthState.mode === 'link') {
      return error('INVALID_OAUTH', 'Use link endpoint for account linking', 400)
    }

    const profile = resolveMockProfile(provider)
    let user = findUserBySocialEmail(profile.email)
    let isNewUser = false

    if (!user) {
      user = createSocialUser(provider, profile, mockDb)
      isNewUser = true
    } else {
      user.authProviders = mergeAuthProviders(user.authProviders, provider)
      const links = mockDb.getSocialLinks(user.id)
      if (!links.some((l) => l.provider === provider)) {
        mockDb.setSocialLinks(user.id, [
          ...links,
          { provider, email: profile.email, linkedAt: new Date().toISOString() },
        ])
      }
    }

    const token = issueToken(user.id)
    return json({ user, token, isNewUser })
  }),

  http.post(p('/auth/oauth/:provider/link'), async ({ params, request }) => {
    const provider = params.provider as string
    if (!isSocialProvider(provider)) {
      return error('INVALID_PROVIDER', 'Unsupported social provider', 400)
    }

    const userId = getUserId(request)
    if (!userId) return error('UNAUTHORIZED', 'Not authenticated', 401)

    const body = (await request.json()) as { code?: string; state?: string }
    if (!body.code?.startsWith('mock-') || !body.state) {
      return error('INVALID_OAUTH', 'Invalid OAuth code or state', 400)
    }

    const oauthState = consumeOAuthState(body.state)
    if (!oauthState || oauthState.mode !== 'link' || oauthState.userId !== userId) {
      return error('INVALID_OAUTH', 'OAuth state expired or invalid', 400)
    }

    const user = mockDb.getUser(userId)
    if (!user) return error('NOT_FOUND', 'User not found', 404)

    const profile = resolveMockProfile(provider)
    const existingLinks = mockDb.getSocialLinks(userId)
    if (existingLinks.some((l) => l.provider === provider)) {
      return error('ALREADY_LINKED', 'This provider is already connected', 409)
    }

    const emailOwner = findUserBySocialEmail(profile.email)
    if (emailOwner && emailOwner.id !== userId) {
      return error('EMAIL_IN_USE', 'This social account is linked to another user', 409)
    }

    user.authProviders = mergeAuthProviders(user.authProviders, provider)
    mockDb.setSocialLinks(userId, [
      ...existingLinks,
      { provider, email: profile.email, linkedAt: new Date().toISOString() },
    ])

    return json({ user })
  }),

  http.delete(p('/auth/oauth/:provider/unlink'), ({ params, request }) => {
    const provider = params.provider as string
    if (!isSocialProvider(provider)) {
      return error('INVALID_PROVIDER', 'Unsupported social provider', 400)
    }

    const userId = getUserId(request)
    if (!userId) return error('UNAUTHORIZED', 'Not authenticated', 401)

    const user = mockDb.getUser(userId)
    if (!user) return error('NOT_FOUND', 'User not found', 404)

    const links = mockDb.getSocialLinks(userId)
    if (!links.some((l) => l.provider === provider)) {
      return error('NOT_LINKED', 'Provider is not connected', 400)
    }

    const remainingProviders = removeAuthProvider(user.authProviders, provider)
    const hasEmail = remainingProviders.includes('email')
    const hasOtherSocial = remainingProviders.some((p) => p !== 'email')

    if (!hasEmail && !hasOtherSocial) {
      return error('LAST_AUTH_METHOD', 'Connect email or another social account before disconnecting', 400)
    }

    user.authProviders = remainingProviders
    mockDb.setSocialLinks(
      userId,
      links.filter((l) => l.provider !== provider),
    )

    return json({ user })
  }),

  http.get(p('/auth/linked-accounts'), ({ request }) => {
    const userId = getUserId(request)
    if (!userId) return error('UNAUTHORIZED', 'Not authenticated', 401)

    const accounts = mockDb.getSocialLinks(userId)
    const linked = new Set(accounts.map((a) => a.provider))
    const availableProviders = ALL_SOCIAL_PROVIDERS.filter((p) => !linked.has(p))

    return json({ accounts, availableProviders })
  }),

  http.get(p('/news'), async ({ request }) => {
    const url = new URL(request.url)
    const sportParam = url.searchParams.get('sport') ?? 'soccer'
    const sport: SportsNewsSport = sportParam === 'all' ? 'all' : 'soccer'
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit') ?? 10), 1), 20)
    const offset = Math.max(Number(url.searchParams.get('offset') ?? 0), 0)

    try {
      const espnUrl = buildEspnNewsUrl(sport, limit, offset)
      const response = await fetch(espnUrl, {
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        return json(getFallbackSportsNewsFeed(limit))
      }

      const payload = (await response.json()) as EspnNewsApiResponse
      return json(mapEspnNewsResponse(payload))
    } catch {
      return json(getFallbackSportsNewsFeed(limit))
    }
  }),

  http.get(p('/dashboard'), ({ request }) => {
    const userId = getUserId(request)
    if (!userId) return error('UNAUTHORIZED', 'Not authenticated', 401)
    const user = mockDb.getUser(userId)!
    const activeBets = mockDb.getBets().filter((b) => b.userId === userId && b.status === 'active')
    const entry = mockDb.leaderboard.find((e) => e.userId === userId)
    return json({
      balance: user.balance,
      rank: user.rank,
      activeBetsCount: activeBets.length,
      todayProfitLoss: 120,
      recentActivity: mockDb.getTransactions().filter((t) => t.userId === userId).slice(0, 5),
      form: entry?.form ?? [],
    })
  }),

  http.get(p('/wallet'), ({ request }) => {
    const userId = getUserId(request)
    if (!userId) return error('UNAUTHORIZED', 'Not authenticated', 401)
    const user = mockDb.getUser(userId)!
    return json({
      balance: user.balance,
      transactions: mockDb.getTransactions().filter((t) => t.userId === userId),
    })
  }),

  http.get(p('/fixtures/leagues'), ({ request }) => {
    const url = new URL(request.url)
    const sportId = url.searchParams.get('sportId')
    let result = mockDb.leagues
    if (sportId) result = result.filter((l) => l.sportId === sportId)
    return json(result)
  }),

  http.get(p('/fixtures'), ({ request }) => {
    const url = new URL(request.url)
    const leagueId = url.searchParams.get('leagueId')
    const status = url.searchParams.get('status')
    const sportId = url.searchParams.get('sportId')
    let result = mockDb.matches
    if (leagueId) result = result.filter((m) => m.leagueId === leagueId)
    if (status) result = result.filter((m) => m.status === status)
    if (sportId) {
      const leagueIds = mockDb.leagues.filter((l) => l.sportId === sportId).map((l) => l.id)
      result = result.filter((m) => leagueIds.includes(m.leagueId))
    }
    return json(
      result.map((m) => ({
        ...m,
        homeTeam: mockDb.getTeam(m.homeTeamId),
        awayTeam: mockDb.getTeam(m.awayTeamId),
        league: mockDb.getLeague(m.leagueId),
      })),
    )
  }),

  http.get(p('/fixtures/:matchId'), ({ params }) => {
    const match = mockDb.getMatch(params.matchId as string)
    if (!match) return error('NOT_FOUND', 'Match not found', 404)
    return json({
      ...match,
      homeTeam: mockDb.getTeam(match.homeTeamId),
      awayTeam: mockDb.getTeam(match.awayTeamId),
      league: mockDb.getLeague(match.leagueId),
    })
  }),

  http.get(p('/bets'), ({ request }) => {
    const userId = getUserId(request)
    if (!userId) return error('UNAUTHORIZED', 'Not authenticated', 401)
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    let userBets = mockDb.getBets().filter((b) => b.userId === userId)
    if (status) userBets = userBets.filter((b) => b.status === status)
    return json(userBets.map((b) => mockDb.enrichBet(b)).sort((a, b) => b.placedAt.localeCompare(a.placedAt)))
  }),

  http.post(p('/bets'), async ({ request }) => {
    const userId = getUserId(request)
    if (!userId) return error('UNAUTHORIZED', 'Not authenticated', 401)
    const body = (await request.json()) as {
      matchId: string
      marketType: string
      selectionId: string
      stake: number
    }
    const user = mockDb.getUser(userId)!
    const match = mockDb.getMatch(body.matchId)
    if (!match) return error('NOT_FOUND', 'Match not found', 404)
    if (match.status === 'finished') return error('MATCH_FINISHED', 'Cannot bet on finished match', 400)

    const betSize = getBetSize(body.stake)
    if (!betSize) {
      return error('INVALID_STAKE', `Stake must be 1-${bettingRules.smallBetMax} (small) or ${bettingRules.bigBetMin}-${bettingRules.bigBetMax} (big)`, 400)
    }
    if (body.stake > user.balance) {
      return error('INSUFFICIENT_BALANCE', 'Insufficient virtual credits', 400)
    }
    if (betSize === 'big') {
      const count = mockDb.getTodayBigBetCount(userId)
      if (count >= bettingRules.dailyBigBetLimit) {
        return error('DAILY_BIG_BET_LIMIT', `Daily big bet limit (${bettingRules.dailyBigBetLimit}) reached`, 400)
      }
    }

    const market = match.markets.find((m) => m.marketType === body.marketType)
    const selection = market?.selections.find((s) => s.id === body.selectionId)
    if (!selection) return error('INVALID_SELECTION', 'Invalid market selection', 400)

    const odds = selection.value
    const potentialReturn = body.marketType === 'malay' ? malayReturn(body.stake, odds) : body.stake * (odds > 0 ? odds : 2)

    const bet: Bet = {
      id: `bet-${Date.now()}`,
      userId,
      matchId: body.matchId,
      marketType: body.marketType as Bet['marketType'],
      selectionId: body.selectionId,
      selectionLabel: selection.label,
      odds,
      stake: body.stake,
      potentialReturn: Math.round(potentialReturn),
      status: 'active',
      betSize,
      placedAt: new Date().toISOString(),
    }

    const bets = mockDb.getBets()
    bets.push(bet)
    mockDb.setBets(bets)

    user.balance -= body.stake
    if (betSize === 'big') mockDb.incrementBigBetCount(userId)

    const tx = mockDb.getTransactions()
    tx.unshift({
      id: `tx-${Date.now()}`,
      userId,
      type: 'bet_placed',
      amount: -body.stake,
      balanceAfter: user.balance,
      description: `Bet placed on ${selection.label}`,
      createdAt: new Date().toISOString(),
      betId: bet.id,
    })
    mockDb.setTransactions(tx)

    return json(mockDb.enrichBet(bet), 201)
  }),

  http.post(p('/bets/:betId/cancel'), async ({ params, request }) => {
    const userId = getUserId(request)
    if (!userId) return error('UNAUTHORIZED', 'Not authenticated', 401)
    const bet = mockDb.getBets().find((b) => b.id === params.betId && b.userId === userId)
    if (!bet) return error('NOT_FOUND', 'Bet not found', 404)
    if (bet.status !== 'active') return error('BET_NOT_ACTIVE', 'Only active bets can be cancelled', 400)

    const penalty = calculateCancellationPenalty(bet.stake)
    const refund = bet.stake - penalty
    const user = mockDb.getUser(userId)!
    user.balance += refund

    bet.status = 'cancelled'
    bet.settledAt = new Date().toISOString()
    bet.profitLoss = -penalty

    const tx = mockDb.getTransactions()
    tx.unshift({
      id: `tx-${Date.now()}`,
      userId,
      type: 'bet_cancelled',
      amount: refund,
      balanceAfter: user.balance,
      description: `Bet cancelled (penalty: ${penalty} credits)`,
      createdAt: new Date().toISOString(),
      betId: bet.id,
    })
    if (penalty > 0) {
      tx.unshift({
        id: `tx-${Date.now()}-penalty`,
        userId,
        type: 'penalty',
        amount: -penalty,
        balanceAfter: user.balance,
        description: 'Cancellation penalty',
        createdAt: new Date().toISOString(),
        betId: bet.id,
      })
    }
    mockDb.setTransactions(tx)

    return json(mockDb.enrichBet(bet))
  }),

  http.get(p('/leaderboard'), ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase()
    const sort = url.searchParams.get('sort') ?? 'points'
    let entries = [...mockDb.leaderboard]
    if (search) {
      entries = entries.filter(
        (e) => e.displayName.toLowerCase().includes(search) || e.username.toLowerCase().includes(search),
      )
    }
    entries.sort((a, b) => {
      if (sort === 'roi') return b.roi - a.roi
      if (sort === 'profitLoss') return b.profitLoss - a.profitLoss
      if (sort === 'winRate') return b.winRate - a.winRate
      return b.points - a.points
    })
    return json(entries)
  }),

  http.get(p('/players/:userId'), ({ params }) => {
    const stats = mockDb.getProfileStats(params.userId as string)
    if (!stats) return error('NOT_FOUND', 'Player not found', 404)
    return json(stats)
  }),

  http.get(p('/players/:userId/bets'), ({ params, request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    let userBets = mockDb.getBets().filter((b) => b.userId === params.userId)
    if (status) userBets = userBets.filter((b) => b.status === status)
    return json(userBets.map((b) => mockDb.enrichBet(b)))
  }),

  http.get(p('/seasons'), () => json(mockDb.seasons)),

  http.get(p('/seasons/:seasonId'), ({ params }) => {
    const season = mockDb.seasons.find((s) => s.id === params.seasonId)
    if (!season) return error('NOT_FOUND', 'Season not found', 404)
    return json(season)
  }),

  http.get(p('/notifications'), ({ request }) => {
    const userId = getUserId(request)
    if (!userId) return error('UNAUTHORIZED', 'Not authenticated', 401)
    return json(mockDb.getNotifications().filter((n) => n.userId === userId))
  }),

  http.patch(p('/notifications/:id/read'), ({ params, request }) => {
    const userId = getUserId(request)
    if (!userId) return error('UNAUTHORIZED', 'Not authenticated', 401)
    const notifs = mockDb.getNotifications()
    const notif = notifs.find((n) => n.id === params.id && n.userId === userId)
    if (!notif) return error('NOT_FOUND', 'Notification not found', 404)
    notif.read = true
    return json(notif)
  }),

  http.patch(p('/profile'), async ({ request }) => {
    const userId = getUserId(request)
    if (!userId) return error('UNAUTHORIZED', 'Not authenticated', 401)
    const body = (await request.json()) as { displayName?: string; username?: string; avatarUrl?: string }
    const user = mockDb.getUser(userId)!
    if (body.displayName) user.displayName = body.displayName
    if (body.username) user.username = body.username
    if (body.avatarUrl) user.avatarUrl = body.avatarUrl
    return json(user)
  }),

  http.get(p('/settings'), ({ request }) => {
    const userId = getUserId(request)
    if (!userId) return error('UNAUTHORIZED', 'Not authenticated', 401)
    return json(mockDb.settings[userId] ?? { emailNotifications: true, pushNotifications: false, showProfilePublic: true })
  }),

  http.patch(p('/settings'), async ({ request }) => {
    const userId = getUserId(request)
    if (!userId) return error('UNAUTHORIZED', 'Not authenticated', 401)
    const body = (await request.json()) as Record<string, boolean>
    mockDb.settings[userId] = { ...mockDb.settings[userId], ...body }
    return json(mockDb.settings[userId])
  }),

  // Catch-all — never passthrough /api to a missing backend
  http.all(`${mockApiBase}/*`, ({ request }) => {
    const pathname = new URL(request.url).pathname
    return HttpResponse.json(
      { code: 'NOT_FOUND', message: `No mock handler for ${pathname}` },
      { status: 404 },
    )
  }),
]
