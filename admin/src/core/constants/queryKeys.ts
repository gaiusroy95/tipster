export const queryKeys = {
  auth: { me: () => ['auth', 'me'] as const },
  dashboard: { stats: () => ['admin', 'stats'] as const },
  users: (params?: Record<string, unknown>) => ['admin', 'users', params] as const,
  leagues: () => ['admin', 'leagues'] as const,
  seasons: () => ['admin', 'seasons'] as const,
  bets: (params?: Record<string, unknown>) => ['admin', 'bets', params] as const,
  forum: (params?: Record<string, unknown>) => ['admin', 'forum', params] as const,
  audit: (params?: Record<string, unknown>) => ['admin', 'audit', params] as const,
}
