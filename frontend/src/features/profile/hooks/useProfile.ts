import { useQuery, type QueryClient } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import type { UserProfileStats, Bet } from '@/mocks/data/types'
import { queryKeys } from '@/core/constants/queryKeys'

const PROFILE_STALE_MS = 60_000
const BETS_STALE_MS = 30_000

export async function fetchPlayerProfile(userId: string) {
  const res = await apiClient.get<ApiResponse<UserProfileStats>>(`/players/${userId}`)
  return res.data.data
}

export function prefetchPlayerProfile(queryClient: QueryClient, userId: string) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.profile.detail(userId),
    queryFn: () => fetchPlayerProfile(userId),
    staleTime: PROFILE_STALE_MS,
  })
}

export function usePlayerProfile(userId: string) {
  return useQuery({
    queryKey: queryKeys.profile.detail(userId),
    queryFn: () => fetchPlayerProfile(userId),
    enabled: !!userId,
    staleTime: PROFILE_STALE_MS,
  })
}

export function usePlayerBets(
  userId: string,
  status?: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.profile.bets(userId, status),
    queryFn: async () => {
      const params = status ? { status } : {}
      const res = await apiClient.get<ApiResponse<Bet[]>>(`/players/${userId}/bets`, { params })
      return res.data.data
    },
    enabled: !!userId && (options?.enabled ?? true),
    staleTime: BETS_STALE_MS,
  })
}
