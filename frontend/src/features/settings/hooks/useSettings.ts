import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import type { User, UserSettings, SignatureMode } from '@/mocks/data/types'
import { queryKeys } from '@/core/constants/queryKeys'
import { useAuthStore } from '@/features/auth/stores/authStore'

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings.all(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<UserSettings>>('/settings')
      return res.data.data
    },
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<UserSettings>) => {
      const res = await apiClient.patch<ApiResponse<UserSettings>>('/settings', data)
      return res.data.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.settings.all() }),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)
  return useMutation({
    mutationFn: async (data: {
      displayName?: string
      username?: string
      avatarUrl?: string | null
      country?: string
      signature?: string
      signatureLink?: string
      signatureMode?: SignatureMode
    }) => {
      const res = await apiClient.patch<ApiResponse<User>>('/profile', data)
      return res.data.data
    },
    onSuccess: (user) => {
      setUser(user)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.detail(user.id) })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiClient.post<ApiResponse<{ message: string }>>('/profile/change-password', data)
      return res.data.data
    },
  })
}

export function useChangeEmail() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await apiClient.post<ApiResponse<User>>('/profile/change-email', data)
      return res.data.data
    },
    onSuccess: (user) => {
      setUser(user)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
    },
  })
}
