import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import type { Bet } from '@/mocks/data/types'
import { queryKeys } from '@/core/constants/queryKeys'
import {
  findRecentMatchingBet,
  syncBetStateAfterPlacement,
  type PlaceBetPayload,
} from '@/features/bets/lib/syncBetState'

export function useBets(status?: string) {
  return useQuery({
    queryKey: queryKeys.bets.list(status),
    queryFn: async () => {
      const params = status ? { status } : {}
      const res = await apiClient.get<ApiResponse<Bet[]>>('/bets', { params })
      return res.data.data
    },
  })
}

export function useDailyBetLimit() {
  return useQuery({
    queryKey: queryKeys.bets.dailyLimit(),
    queryFn: async () => {
      const res = await apiClient.get<
        ApiResponse<{ betsUsed: number; betsLimit: number; resetsAt: string }>
      >('/bets/daily-limit')
      return res.data.data
    },
  })
}

export function usePlaceBet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: PlaceBetPayload) => {
      const res = await apiClient.post<ApiResponse<Bet>>('/bets', data, {
        timeout: 30000,
      })
      return res.data.data
    },
    onSuccess: () => {
      syncBetStateAfterPlacement(queryClient)
    },
  })
}

export function useCancelBet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (betId: string) => {
      const res = await apiClient.post<ApiResponse<Bet>>(`/bets/${betId}/cancel`, undefined, {
        timeout: 30000,
      })
      return res.data.data
    },
    onSuccess: () => {
      syncBetStateAfterPlacement(queryClient)
    },
  })
}

export async function reconcileBetPlacement(
  payload: PlaceBetPayload,
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<boolean> {
  const bet = await findRecentMatchingBet(payload)
  if (!bet) return false
  syncBetStateAfterPlacement(queryClient)
  return true
}
