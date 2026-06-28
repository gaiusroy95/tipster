import type { QueryClient } from '@tanstack/react-query'
import { adminClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import { queryKeys } from '@/core/constants/queryKeys'
import type { DashboardStats } from '@/features/dashboard/lib/dashboardUtils'

const SHELL_READY_TIMEOUT_MS = 4_000

/** Prefetch dashboard stats before revealing the admin shell. */
export async function ensureAdminShellReady(queryClient: QueryClient): Promise<void> {
  await Promise.race([
    queryClient.ensureQueryData({
      queryKey: queryKeys.dashboard.stats(),
      queryFn: async () => {
        const res = await adminClient.get<ApiResponse<DashboardStats>>('/stats')
        return res.data.data
      },
      staleTime: 30_000,
    }),
    new Promise<void>((resolve) => setTimeout(resolve, SHELL_READY_TIMEOUT_MS)),
  ])
}
