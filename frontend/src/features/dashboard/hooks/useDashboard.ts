import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import type { DashboardData } from '@/mocks/data/types'
import { queryKeys } from '@/core/constants/queryKeys'

const DASHBOARD_POLL_MS = 30_000

export function useDashboard(enabled = true) {
  return useQuery({
    queryKey: queryKeys.dashboard.all(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<DashboardData>>('/dashboard')
      return res.data.data
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: (query) => {
      const data = query.state.data
      return data && data.activeBetsCount > 0 ? DASHBOARD_POLL_MS : false
    },
  })
}
