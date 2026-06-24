import { useQuery, type QueryClient } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import { queryKeys } from '@/core/constants/queryKeys'
import { getFallbackSportsNewsFeed } from '@/features/news/api/fallbackNews'
import type { SportsNewsFeed, SportsNewsQuery } from '@/features/news/types/news'

const NEWS_STALE_MS = 5 * 60_000

function newsQueryParams(query: SportsNewsQuery = {}) {
  const sport = query.sport ?? 'soccer'
  const limit = query.limit ?? 10
  const offset = query.offset ?? 0
  return { sport, limit, offset }
}

async function fetchSportsNews(query: SportsNewsQuery = {}) {
  const { sport, limit, offset } = newsQueryParams(query)
  const res = await apiClient.get<ApiResponse<SportsNewsFeed>>('/news', {
    params: { sport, limit, offset },
  })
  return res.data.data
}

export function prefetchSportsNews(queryClient: QueryClient, query: SportsNewsQuery = {}) {
  const { sport, limit, offset } = newsQueryParams(query)
  return queryClient.prefetchQuery({
    queryKey: queryKeys.news.list(sport, limit, offset),
    queryFn: () => fetchSportsNews(query),
    staleTime: NEWS_STALE_MS,
  })
}

export function useSportsNews(query: SportsNewsQuery = {}) {
  const { sport, limit, offset } = newsQueryParams(query)

  return useQuery({
    queryKey: queryKeys.news.list(sport, limit, offset),
    queryFn: () => fetchSportsNews(query),
    staleTime: NEWS_STALE_MS,
    placeholderData: () => getFallbackSportsNewsFeed(limit),
  })
}
