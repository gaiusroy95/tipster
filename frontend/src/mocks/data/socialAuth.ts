import type { User, AuthProviderKind } from '@/mocks/data/types'
import type { SocialAuthProvider } from '@/features/auth/types/socialAuth'
import { bettingRules } from '@/core/config/bettingRules'

export interface SocialLink {
  provider: SocialAuthProvider
  email: string
  linkedAt: string
}

export interface OAuthState {
  provider: SocialAuthProvider
  mode: 'login' | 'register' | 'link'
  redirectUri: string
  userId?: string
  expiresAt: number
}

const OAUTH_STATE_TTL_MS = 10 * 60 * 1000

const oauthStates: Record<string, OAuthState> = {}

const mockProfiles: Record<SocialAuthProvider, { email: string; displayName: string; avatarUrl?: string }> = {
  google: {
    email: 'social.google@example.com',
    displayName: 'Google Player',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google-player',
  },
  facebook: {
    email: 'social.facebook@example.com',
    displayName: 'Facebook Player',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=facebook-player',
  },
  apple: {
    email: 'social.apple@example.com',
    displayName: 'Apple Player',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=apple-player',
  },
}

function randomId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function sanitizeUsername(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || 'player'
}

export function createOAuthState(
  provider: SocialAuthProvider,
  mode: OAuthState['mode'],
  redirectUri: string,
  userId?: string,
): string {
  const state = randomId('state')
  oauthStates[state] = {
    provider,
    mode,
    redirectUri,
    userId,
    expiresAt: Date.now() + OAUTH_STATE_TTL_MS,
  }
  return state
}

export function consumeOAuthState(state: string): OAuthState | null {
  const record = oauthStates[state]
  if (!record) return null
  delete oauthStates[state]
  if (Date.now() > record.expiresAt) return null
  return record
}

export function buildMockCallbackUrl(
  provider: SocialAuthProvider,
  mode: OAuthState['mode'],
  redirectUri: string,
  userId?: string,
): string {
  const state = createOAuthState(provider, mode, redirectUri, userId)
  const code = `mock-${provider}-code`
  const url = new URL(redirectUri)
  url.searchParams.set('provider', provider)
  url.searchParams.set('code', code)
  url.searchParams.set('state', state)
  return url.toString()
}

export function resolveMockProfile(provider: SocialAuthProvider) {
  return mockProfiles[provider]
}

export function mergeAuthProviders(
  existing: AuthProviderKind[] | undefined,
  provider: SocialAuthProvider,
): AuthProviderKind[] {
  const set = new Set<AuthProviderKind>(existing ?? [])
  set.add(provider)
  return Array.from(set)
}

export function removeAuthProvider(
  existing: AuthProviderKind[] | undefined,
  provider: SocialAuthProvider,
): AuthProviderKind[] {
  return (existing ?? []).filter((p) => p !== provider)
}

export function createSocialUser(
  provider: SocialAuthProvider,
  profile: { email: string; displayName: string; avatarUrl?: string },
  mockDb: {
    demoUsers: User[]
    leaderboard: { userId: string; displayName: string; username: string; rank: number; points: number; roi: number; profitLoss: number; winRate: number; totalBets: number; form: ('W' | 'L' | 'D')[] }[]
    getTransactions: () => import('@/mocks/data/types').WalletTransaction[]
    setTransactions: (tx: import('@/mocks/data/types').WalletTransaction[]) => void
    setSocialLinks: (userId: string, links: SocialLink[]) => void
  },
): User {
  const id = randomId('user')
  const usernameBase = sanitizeUsername(profile.displayName)
  const username = `${usernameBase}${Math.floor(Math.random() * 900 + 100)}`
  const user: User = {
    id,
    email: profile.email,
    displayName: profile.displayName,
    username,
    avatarUrl: profile.avatarUrl,
    balance: bettingRules.initialBalance,
    rank: mockDb.leaderboard.length + 1,
    createdAt: new Date().toISOString(),
    authProviders: [provider],
    primaryAuthProvider: provider,
  }

  mockDb.demoUsers.push(user)
  mockDb.leaderboard.push({
    userId: id,
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

  const tx = mockDb.getTransactions()
  tx.unshift({
    id: randomId('tx'),
    userId: id,
    type: 'initial',
    amount: bettingRules.initialBalance,
    balanceAfter: bettingRules.initialBalance,
    description: 'Welcome bonus — initial virtual credits',
    createdAt: new Date().toISOString(),
  })
  mockDb.setTransactions(tx)

  mockDb.setSocialLinks(id, [
    {
      provider,
      email: profile.email,
      linkedAt: new Date().toISOString(),
    },
  ])

  return user
}
