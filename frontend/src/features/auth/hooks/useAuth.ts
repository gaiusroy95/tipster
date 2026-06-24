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

interface RegisterResponse {
  message: string
  email: string
  devVerificationUrl?: string
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
  return useMutation({
    mutationFn: async (data: { email: string; password: string; displayName: string; username: string }) => {
      const res = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', data)
      return res.data.data
    },
  })
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const res = await apiClient.get<ApiResponse<{ available: boolean }>>('/auth/check-username', {
    params: { username },
  })
  return res.data.data.available
}

export async function checkEmailAvailable(email: string): Promise<boolean> {
  const res = await apiClient.get<ApiResponse<{ available: boolean }>>('/auth/check-email', {
    params: { email },
  })
  return res.data.data.available
}

export function useVerifyEmail() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { token: string }) => {
      const res = await apiClient.post<ApiResponse<AuthResponse & { message: string }>>(
        '/auth/verify-email',
        data,
      )
      return res.data.data
    },
    onSuccess: ({ user, token }) => {
      setAuth(user, token)
      if (import.meta.env.VITE_ENABLE_MSW === 'true') {
        import('@/mocks/data/seed').then(({ mockDb }) => mockDb.upsertRemoteUser(user))
      }
      queryClient.clear()
    },
  })
}

export function useResendVerification() {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await apiClient.post<ApiResponse<{ message: string; devVerificationUrl?: string }>>(
        '/auth/resend-verification',
        data,
      )
      return res.data.data
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
