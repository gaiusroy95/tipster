import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import type { Notification } from '@/mocks/data/types'
import { queryKeys } from '@/core/constants/queryKeys'

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.all(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Notification[]>>('/notifications')
      return res.data.data
    },
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`)
      return res.data.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() }),
  })
}
