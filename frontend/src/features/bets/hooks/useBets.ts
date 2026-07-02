import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import type { Bet } from '@/mocks/data/types'
import { queryKeys } from '@/core/constants/queryKeys'
import {
  findRecentMatchingBet,
  syncBetStateAfterPlacement,
  syncBetStateAfterSettlement,
  type PlaceBetPayload,
} from '@/features/bets/lib/syncBetState'

const ACTIVE_BETS_POLL_MS = 30_000

export function useBets(status?: string, options?: { pollWhileActive?: boolean }) {
  const pollWhileActive = options?.pollWhileActive ?? status === 'active'
  return useQuery({
    queryKey: queryKeys.bets.list(status),
    queryFn: async () => {
      const params = status ? { status } : {}
      const res = await apiClient.get<ApiResponse<Bet[]>>('/bets', { params })
      return res.data.data
    },
    refetchInterval: (query) => {
      if (!pollWhileActive) return false
      const bets = query.state.data
      return bets && bets.length > 0 ? ACTIVE_BETS_POLL_MS : false
    },
  })
}

/** Poll active bets and refresh wallet/dashboard when settlements complete. */
export function useActiveBetsSettlementSync() {
  const queryClient = useQueryClient()
  const prevActiveCountRef = useRef<number | null>(null)
  const { data: activeBets = [] } = useBets('active', { pollWhileActive: true })

  useEffect(() => {
    const count = activeBets.length
    if (prevActiveCountRef.current !== null && count < prevActiveCountRef.current) {
      syncBetStateAfterSettlement(queryClient)
    }
    prevActiveCountRef.current = count
  }, [activeBets.length, queryClient])
}

export function useDailyBetLimit() {
  return useQuery({
    queryKey: queryKeys.bets.dailyLimit(),
    queryFn: async () => {
      const res = await apiClient.get<
        ApiResponse<{
          betsUsed: number
          betsLimit: number
          bigBetsUsed: number
          bigBetsLimit: number
          resetsAt: string
        }>
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
): Promise<Bet | null> {
  const bet = await findRecentMatchingBet(payload)
  if (!bet) return null
  syncBetStateAfterPlacement(queryClient)
  return bet
}
