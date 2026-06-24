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
    dailyLimit: () => ['bets', 'daily-limit'] as const,
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
  forum: {
    all: () => ['forum'] as const,
    categories: () => ['forum', 'categories'] as const,
    tags: () => ['forum', 'tags'] as const,
    list: (limit?: number, offset?: number, category?: string, tag?: string) =>
      ['forum', 'list', limit, offset, category, tag] as const,
    detail: (slug: string) => ['forum', 'detail', slug] as const,
    comments: (postId: string) => ['forum', 'comments', postId] as const,
    drafts: () => ['forum', 'drafts'] as const,
    scheduled: () => ['forum', 'scheduled'] as const,
  },
  achievements: {
    all: () => ['achievements'] as const,
  },
  news: {
    list: (sport?: string, limit?: number, offset?: number) =>
      ['news', sport, limit, offset] as const,
  },
}
