import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import type { User } from '@/mocks/data/types'
import { queryKeys } from '@/core/constants/queryKeys'
import { useAuthStore } from '@/features/auth/stores/authStore'

interface AuthResponse {
  user: User
  token: string
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data)
      return res.data.data
    },
    onSuccess: ({ user, token }) => {
      setAuth(user, token)
      queryClient.clear()
    },
  })
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { email: string; password: string; displayName: string; username: string }) => {
      const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data)
      return res.data.data
    },
    onSuccess: ({ user, token }) => {
      setAuth(user, token)
      queryClient.clear()
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', data)
      return res.data.data
    },
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      const res = await apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', data)
      return res.data.data
    },
  })
}

export function useMe() {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<User>>('/auth/me')
      return res.data.data
    },
    enabled: !!token,
  })
}
