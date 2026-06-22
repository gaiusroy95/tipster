import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import { queryKeys } from '@/core/constants/queryKeys'
import type { AchievementProgress } from '@/features/achievements/types/achievement'

export function useAchievements() {
  return useQuery({
    queryKey: queryKeys.achievements.all(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<AchievementProgress[]>>('/achievements')
      return res.data.data
    },
  })
}
