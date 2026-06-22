import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import type { Bet } from '@/mocks/data/types'
import { queryKeys } from '@/core/constants/queryKeys'
import { useAuthStore } from '@/features/auth/stores/authStore'

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

export function usePlaceBet() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: async (data: {
      matchId: string
      marketType: string
      selectionId: string
      stake: number
    }) => {
      const res = await apiClient.post<ApiResponse<Bet>>('/bets', data)
      return res.data.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.bets.all() })
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
      await queryClient.invalidateQueries({ queryKey: queryKeys.achievements.all() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() })
      const meRes = await apiClient.get<ApiResponse<{ balance: number } & Record<string, unknown>>>('/auth/me')
      const user = useAuthStore.getState().user
      if (user) setUser({ ...user, balance: meRes.data.data.balance as number })
    },
  })
}

export function useCancelBet() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: async (betId: string) => {
      const res = await apiClient.post<ApiResponse<Bet>>(`/bets/${betId}/cancel`)
      return res.data.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.bets.all() })
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
      await queryClient.invalidateQueries({ queryKey: queryKeys.achievements.all() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() })
      const meRes = await apiClient.get<ApiResponse<{ balance: number } & Record<string, unknown>>>('/auth/me')
      const user = useAuthStore.getState().user
      if (user) setUser({ ...user, balance: meRes.data.data.balance as number })
    },
  })
}
