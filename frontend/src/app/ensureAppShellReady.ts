import type { QueryClient } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import { queryKeys } from '@/core/constants/queryKeys'
import { MATCH_STATUS } from '@/core/constants/markets'
import { DEFAULT_SPORT_ID } from '@/core/constants/sports'
import {
  fetchCuratedSportCategories,
  loadArenaBootstrap,
  warmupSportsApiCaches,
} from '@/features/fixtures/api/sportsApi'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { prefetchActiveSeason } from '@/features/seasons/hooks/useSeasons'
import type { Bet, DashboardData } from '@/mocks/data/types'

const SHELL_READY_TIMEOUT_MS = 4_000

function prefetchShellExtras(queryClient: QueryClient, user: ReturnType<typeof useAuthStore.getState>['user']) {
  void prefetchActiveSeason(queryClient)
  void queryClient.prefetchQuery({
    queryKey: queryKeys.fixtures.curatedSports(),
    queryFn: fetchCuratedSportCategories,
    staleTime: 5 * 60_000,
  })

  if (!user) return

  void queryClient.prefetchQuery({
    queryKey: queryKeys.dashboard.all(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<DashboardData>>('/dashboard')
      return res.data.data
    },
    staleTime: 60_000,
  })
  void queryClient.prefetchQuery({
    queryKey: queryKeys.bets.list('active'),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Bet[]>>('/bets', {
        params: { status: 'active' },
      })
      return res.data.data
    },
    staleTime: 30_000,
  })
}

/**
 * One bundled sports request loads matches + leagues for the splash screen.
 * Profile and season widgets continue loading in the background.
 */
export async function ensureAppShellReady(queryClient: QueryClient): Promise<void> {
  warmupSportsApiCaches()

  const user = useAuthStore.getState().user
  prefetchShellExtras(queryClient, user)

  const fixtureKey = queryKeys.fixtures.list({
    sportId: DEFAULT_SPORT_ID,
    status: MATCH_STATUS.SCHEDULED,
  })
  const leagueKey = queryKeys.fixtures.leagues(DEFAULT_SPORT_ID)

  await Promise.race([
    loadArenaBootstrap(DEFAULT_SPORT_ID, MATCH_STATUS.SCHEDULED).then(({ fixtures, leagues }) => {
      queryClient.setQueryData(fixtureKey, fixtures)
      queryClient.setQueryData(leagueKey, leagues)
    }),
    new Promise<void>((resolve) => setTimeout(resolve, SHELL_READY_TIMEOUT_MS)),
  ])
}
