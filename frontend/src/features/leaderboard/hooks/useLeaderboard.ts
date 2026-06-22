import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import type { LeaderboardEntry } from '@/mocks/data/types'
import { queryKeys } from '@/core/constants/queryKeys'

export function useLeaderboard(search?: string, sort?: string) {
  return useQuery({
    queryKey: queryKeys.leaderboard.all(search, sort),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<LeaderboardEntry[]>>('/leaderboard', {
        params: { search, sort },
      })
      return res.data.data
    },
  })
}
