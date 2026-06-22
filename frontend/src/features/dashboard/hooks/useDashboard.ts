import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import type { DashboardData } from '@/mocks/data/types'
import { queryKeys } from '@/core/constants/queryKeys'

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.all(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<DashboardData>>('/dashboard')
      return res.data.data
    },
  })
}
