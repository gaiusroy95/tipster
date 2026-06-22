import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import type { UserProfileStats, Bet } from '@/mocks/data/types'
import { queryKeys } from '@/core/constants/queryKeys'

export function usePlayerProfile(userId: string) {
  return useQuery({
    queryKey: queryKeys.profile.detail(userId),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<UserProfileStats>>(`/players/${userId}`)
      return res.data.data
    },
    enabled: !!userId,
  })
}

export function usePlayerBets(userId: string, status?: string) {
  return useQuery({
    queryKey: queryKeys.profile.bets(userId, status),
    queryFn: async () => {
      const params = status ? { status } : {}
      const res = await apiClient.get<ApiResponse<Bet[]>>(`/players/${userId}/bets`, { params })
      return res.data.data
    },
    enabled: !!userId,
  })
}
