import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import { queryKeys } from '@/core/constants/queryKeys'
import type { SportsNewsFeed, SportsNewsQuery } from '@/features/news/types/news'

export function useSportsNews(query: SportsNewsQuery = {}) {
  const sport = query.sport ?? 'soccer'
  const limit = query.limit ?? 10
  const offset = query.offset ?? 0

  return useQuery({
    queryKey: queryKeys.news.list(sport, limit, offset),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<SportsNewsFeed>>('/news', {
        params: { sport, limit, offset },
      })
      return res.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}
