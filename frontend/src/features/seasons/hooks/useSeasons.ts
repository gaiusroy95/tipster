import { useQuery, type QueryClient } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import type { Season } from '@/mocks/data/types'
import { queryKeys } from '@/core/constants/queryKeys'

const SEASON_STALE_MS = 5 * 60_000

async function fetchActiveSeason() {
  const res = await apiClient.get<ApiResponse<Season | null>>('/seasons/active')
  return res.data.data
}

export function prefetchActiveSeason(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.seasons.active(),
    queryFn: fetchActiveSeason,
    staleTime: SEASON_STALE_MS,
  })
}

export function useActiveSeason() {
  return useQuery({
    queryKey: queryKeys.seasons.active(),
    queryFn: fetchActiveSeason,
    staleTime: SEASON_STALE_MS,
  })
}

export function useSeasons(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.seasons.all(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Season[]>>('/seasons')
      return res.data.data
    },
    enabled: options?.enabled ?? true,
    staleTime: SEASON_STALE_MS,
  })
}

export function useSeason(seasonId: string) {
  return useQuery({
    queryKey: queryKeys.seasons.detail(seasonId),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Season>>(`/seasons/${seasonId}`)
      return res.data.data
    },
    enabled: !!seasonId,
    staleTime: SEASON_STALE_MS,
  })
}
