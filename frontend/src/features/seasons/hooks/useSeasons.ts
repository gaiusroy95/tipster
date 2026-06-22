import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import type { Season } from '@/mocks/data/types'
import { queryKeys } from '@/core/constants/queryKeys'

export function useSeasons() {
  return useQuery({
    queryKey: queryKeys.seasons.all(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Season[]>>('/seasons')
      return res.data.data
    },
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
  })
}
