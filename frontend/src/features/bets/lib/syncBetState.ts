import type { QueryClient } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import { queryKeys } from '@/core/constants/queryKeys'
import { useAuthStore } from '@/features/auth/stores/authStore'
import type { Bet } from '@/mocks/data/types'

export interface PlaceBetPayload {
  matchId: string
  marketType: string
  selectionId: string
  stake: number
}

export interface BetPreview {
  odds: number
  potentialReturn: number
  selectionLabel: string
}

export async function previewBetPlacement(payload: PlaceBetPayload): Promise<BetPreview> {
  const res = await apiClient.post<ApiResponse<BetPreview>>('/bets/preview', payload)
  return res.data.data
}

const RECENT_BET_WINDOW_MS = 2 * 60 * 1000

export async function findRecentMatchingBet(
  payload: PlaceBetPayload,
): Promise<Bet | null> {
  try {
    const res = await apiClient.get<ApiResponse<Bet[]>>('/bets', {
      params: { status: 'active' },
    })
    const cutoff = Date.now() - RECENT_BET_WINDOW_MS
    return (
      res.data.data.find(
        (bet) =>
          bet.matchId === payload.matchId &&
          bet.selectionId === payload.selectionId &&
          bet.stake === payload.stake &&
          new Date(bet.placedAt).getTime() > cutoff,
      ) ?? null
    )
  } catch {
    return null
  }
}

export function syncBetStateAfterPlacement(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: queryKeys.bets.all() })
  void queryClient.invalidateQueries({ queryKey: queryKeys.bets.dailyLimit() })
  void queryClient.invalidateQueries({ queryKey: ['profile'] })
  void queryClient.invalidateQueries({ queryKey: queryKeys.achievements.all() })
  void queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all() })
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() })
  void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() })

  void refreshAuthBalance()
}

/** Refresh wallet, dashboard, and profile after bets settle asynchronously. */
export function syncBetStateAfterSettlement(queryClient: QueryClient): void {
  syncBetStateAfterPlacement(queryClient)
}

function refreshAuthBalance(): void {
  void apiClient
    .get<ApiResponse<{ balance: number } & Record<string, unknown>>>('/auth/me')
    .then((meRes) => {
      const user = useAuthStore.getState().user
      if (user) {
        useAuthStore.getState().setUser({
          ...user,
          balance: meRes.data.data.balance as number,
        })
      }
    })
    .catch(() => {
      // Balance refresh is best-effort.
    })
}
