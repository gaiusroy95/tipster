import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { prefetchSportsNews } from '@/features/news/hooks/useSportsNews'
import { prefetchActiveSeason } from '@/features/seasons/hooks/useSeasons'
import { queryKeys } from '@/core/constants/queryKeys'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import type { LeaderboardEntry } from '@/mocks/data/types'
import { DEFAULT_SPORT_ID, FIXTURE_VIEWS } from '@/core/constants/sports'
import { MATCH_STATUS } from '@/core/constants/markets'
import { fixtureViewToStatus } from '@/features/fixtures/hooks/useFixtureNavParams'
import { fetchFixturesFromApi, fetchLeaguesFromApi } from '@/features/fixtures/api/sportsApi'

const LEADERBOARD_STALE_MS = 2 * 60_000

/** Warm dashboard caches as soon as the arena hub mounts. */
export function useArenaPrefetch() {
  const queryClient = useQueryClient()

  useEffect(() => {
    prefetchActiveSeason(queryClient)
    prefetchSportsNews(queryClient, { sport: 'soccer', limit: 10 })

    queryClient.prefetchQuery({
      queryKey: queryKeys.leaderboard.all(undefined, 'points'),
      queryFn: async () => {
        const res = await apiClient.get<ApiResponse<LeaderboardEntry[]>>('/leaderboard', {
          params: { sort: 'points' },
        })
        return res.data.data
      },
      staleTime: LEADERBOARD_STALE_MS,
    })

    const status = fixtureViewToStatus(FIXTURE_VIEWS.UPCOMING)
    queryClient.prefetchQuery({
      queryKey: queryKeys.fixtures.list({
        sportId: DEFAULT_SPORT_ID,
        status,
      }),
      queryFn: () =>
        fetchFixturesFromApi({
          sportId: DEFAULT_SPORT_ID,
          status: MATCH_STATUS.SCHEDULED,
        }),
      staleTime: 30_000,
    })

    queryClient.prefetchQuery({
      queryKey: queryKeys.fixtures.leagues(DEFAULT_SPORT_ID),
      queryFn: () => fetchLeaguesFromApi(DEFAULT_SPORT_ID),
      staleTime: 5 * 60_000,
    })
  }, [queryClient])
}
