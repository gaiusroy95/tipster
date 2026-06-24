export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
    linkedAccounts: () => ['auth', 'linked-accounts'] as const,
  },
  dashboard: {
    all: () => ['dashboard'] as const,
  },
  wallet: {
    all: () => ['wallet'] as const,
  },
  fixtures: {
    all: () => ['fixtures'] as const,
    list: (filters?: { leagueId?: string; status?: string; sportId?: string }) =>
      ['fixtures', 'list', filters?.leagueId, filters?.status, filters?.sportId] as const,
    detail: (matchId: string) => ['fixtures', 'detail', matchId] as const,
    leagues: (sportId?: string) => ['fixtures', 'leagues', sportId] as const,
  },
  bets: {
    all: () => ['bets'] as const,
    list: (status?: string) => ['bets', 'list', status] as const,
  },
  leaderboard: {
    all: (search?: string, sort?: string) => ['leaderboard', search, sort] as const,
  },
  profile: {
    detail: (userId: string) => ['profile', userId] as const,
    bets: (userId: string, status?: string) => ['profile', userId, 'bets', status] as const,
  },
  seasons: {
    all: () => ['seasons'] as const,
    active: () => ['seasons', 'active'] as const,
    detail: (id: string) => ['seasons', id] as const,
  },
  notifications: {
    all: () => ['notifications'] as const,
  },
  settings: {
    all: () => ['settings'] as const,
  },
  achievements: {
    all: () => ['achievements'] as const,
  },
  news: {
    list: (sport?: string, limit?: number, offset?: number) =>
      ['news', sport, limit, offset] as const,
  },
}
