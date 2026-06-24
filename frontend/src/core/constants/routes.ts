export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REGISTER_PENDING: '/auth/register/pending',
  VERIFY_EMAIL: '/auth/verify-email',
  OAUTH_CALLBACK: '/auth/callback',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  FIXTURES: '/fixtures',
  MATCH: '/fixtures/:matchId',
  BET_SLIP: '/bet-slip',
  BETS_ACTIVE: '/bets/active',
  BETS_HISTORY: '/bets/history',
  WALLET: '/wallet',
  LEADERBOARD: '/leaderboard',
  PLAYER: '/players/:userId',
  SEASONS: '/seasons',
  SEASON: '/seasons/:seasonId',
  NOTIFICATIONS: '/notifications',
  PROFILE_EDIT: '/profile/edit',
  SETTINGS: '/settings',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  RULES: '/rules',
  ABOUT: '/about',
  HELP: '/help',
} as const;

export function matchPath(matchId: string) {
  return `/fixtures/${matchId}`
}

export function playerPath(userId: string) {
  return `/players/${userId}`
}

export function seasonPath(seasonId: string) {
  return `/seasons/${seasonId}`
}

export function loginPath(redirect?: string) {
  if (!redirect) return ROUTES.LOGIN
  return `${ROUTES.LOGIN}?redirect=${encodeURIComponent(redirect)}`
}
